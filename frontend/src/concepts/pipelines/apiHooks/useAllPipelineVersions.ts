import React from 'react';
import { PipelineVersionKFv2 } from '~/concepts/pipelines/kfTypes';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import usePipelineQuery from '~/concepts/pipelines/apiHooks/usePipelineQuery';
import {
  ListPipelineVersions,
  PipelineListPaged,
  PipelineOptions,
  PipelineParams,
} from '~/concepts/pipelines/types';
import { FetchState, NotReadyError } from '~/utilities/useFetchState';
import { useAllPipelines } from '~/concepts/pipelines/apiHooks/usePipelines';
import { useDeepCompareMemoize } from '~/utilities/useDeepCompareMemoize';
import { K8sAPIOptions } from '~/k8sTypes';

/**
 * Recursively fetch each pipeline version page when a next_page_token exists.
 */
async function getAllVersions(
  opts: K8sAPIOptions,
  pipelineId: string,
  params: PipelineParams | undefined,
  listPipelineVersions: ListPipelineVersions,
): Promise<PipelineVersionKFv2[]> {
  const result = await listPipelineVersions(opts, pipelineId, params);
  let allVersions = result.pipeline_versions ?? [];

  if (result.next_page_token) {
    const nextVersions = await getAllVersions(
      opts,
      pipelineId,
      { pageSize: result.pipeline_versions?.length, pageToken: result.next_page_token },
      listPipelineVersions,
    );
    allVersions = allVersions.concat(nextVersions);
  }

  return allVersions;
}

/**
 * Fetch all pipelines, then use those pipeline IDs to accumulate a list of pipeline versions.
 */
export const useAllPipelineVersions = (
  options: PipelineOptions = {},
  refreshRate = 0,
): FetchState<PipelineListPaged<PipelineVersionKFv2>> => {
  const { api } = usePipelinesAPI();
  const [{ items: pipelines }, pipelinesLoaded] = useAllPipelines();
  const pipelineIds = useDeepCompareMemoize(pipelines.map((pipeline) => pipeline.pipeline_id));

  return usePipelineQuery<PipelineVersionKFv2>(
    React.useCallback(
      async (opts, params) => {
        if (!pipelinesLoaded) {
          return Promise.reject(new NotReadyError('Pipelines not loaded'));
        }

        const pipelineVersionRequests = pipelineIds.map((pipelineId) =>
          getAllVersions(opts, pipelineId, params, api.listPipelineVersions),
        );
        const results = await Promise.all(pipelineVersionRequests);

        return results.reduce(
          (acc: { total_size: number; items: PipelineVersionKFv2[] }, versions) => {
            // eslint-disable-next-line camelcase
            acc.total_size += versions.length || 0;
            acc.items = acc.items.concat(versions);

            return acc;
          },
          // eslint-disable-next-line camelcase
          { total_size: 0, items: [] },
        );
      },
      [api, pipelineIds, pipelinesLoaded],
    ),
    options,
    refreshRate,
  );
};

/**
 * Fetch all version pages for a single pipeline.
 */
export const useAllVersionsByPipelineId = (
  pipelineId: string,
  options?: PipelineOptions,
  refreshRate?: number,
): FetchState<PipelineListPaged<PipelineVersionKFv2>> => {
  const { api } = usePipelinesAPI();

  return usePipelineQuery<PipelineVersionKFv2>(
    React.useCallback(
      async (opts, params) => {
        if (!pipelineId) {
          return Promise.reject(new NotReadyError('No pipeline ID.'));
        }

        const allVersions = await getAllVersions(
          opts,
          pipelineId,
          params,
          api.listPipelineVersions,
        );

        return { items: allVersions };
      },
      [api.listPipelineVersions, pipelineId],
    ),
    options,
    refreshRate,
  );
};
