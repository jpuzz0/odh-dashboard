import * as React from 'react';
import { PipelineRunKFv2 } from '~/concepts/pipelines/kfTypes';
import { FetchState } from '~/utilities/useFetchState';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import usePipelineQuery from '~/concepts/pipelines/apiHooks/usePipelineQuery';
import {
  ListPipelineRuns,
  PipelineListPaged,
  PipelineRunOptions,
  PipelineRunParams,
} from '~/concepts/pipelines/types';
import { K8sAPIOptions } from '~/k8sTypes';

/**
 * Recursively fetch each active run page when a next_page_token exists.
 */
async function getAllActiveRuns(
  opts: K8sAPIOptions,
  params: PipelineRunParams | undefined,
  listPipelineActiveRuns: ListPipelineRuns,
): Promise<PipelineRunKFv2[]> {
  const result = await listPipelineActiveRuns(opts, params);
  let allActiveRuns = result.runs ?? [];

  if (result.next_page_token) {
    const nextActiveRuns = await getAllActiveRuns(
      opts,
      { ...params, pageToken: result.next_page_token },
      listPipelineActiveRuns,
    );
    allActiveRuns = allActiveRuns.concat(nextActiveRuns);
  }

  return allActiveRuns;
}

/**
 * Fetch all active run pages.
 */
export const useAllPipelineActiveRuns = (
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRunKFv2>> => {
  const { api } = usePipelinesAPI();
  const experimentId = options?.experimentId;
  const pipelineVersionId = options?.pipelineVersionId;

  return usePipelineQuery<PipelineRunKFv2>(
    React.useCallback(
      async (opts, params) => {
        const allRuns = await getAllActiveRuns(
          opts,
          {
            ...params,
            ...(experimentId && { experimentId }),
            ...(pipelineVersionId && { pipelineVersionId }),
          },
          api.listPipelineActiveRuns,
        );

        return { items: allRuns, totalSize: allRuns.length };
      },
      [api, experimentId, pipelineVersionId],
    ),
    options,
  );
};

export const usePipelineActiveRuns = (
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRunKFv2>> => {
  const { api } = usePipelinesAPI();
  const experimentId = options?.experimentId;
  const pipelineVersionId = options?.pipelineVersionId;

  return usePipelineQuery<PipelineRunKFv2>(
    React.useCallback(
      (opts, params) =>
        api
          .listPipelineActiveRuns(opts, {
            ...params,
            ...(experimentId && { experimentId }),
            ...(pipelineVersionId && { pipelineVersionId }),
          })
          .then((result) => ({ ...result, items: result.runs })),
      [api, experimentId, pipelineVersionId],
    ),
    options,
  );
};

export const usePipelineArchivedRuns = (
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRunKFv2>> => {
  const { api } = usePipelinesAPI();
  const experimentId = options?.experimentId;
  const pipelineVersionId = options?.pipelineVersionId;

  return usePipelineQuery<PipelineRunKFv2>(
    React.useCallback(
      (opts, params) =>
        api
          .listPipelineArchivedRuns(opts, {
            ...params,
            ...(experimentId && { experimentId }),
            ...(pipelineVersionId && { pipelineVersionId }),
          })
          .then((result) => ({ ...result, items: result.runs })),
      [api, experimentId, pipelineVersionId],
    ),
    options,
  );
};

export const usePipelineRunsByExperiment = (
  experimentId: string,
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRunKFv2>> => {
  const { api } = usePipelinesAPI();

  return usePipelineQuery<PipelineRunKFv2>(
    React.useCallback(
      (opts, params) =>
        api
          // eslint-disable-next-line camelcase
          .listPipelineRuns(opts, { ...params, experimentId })
          .then((result) => ({ ...result, items: result.runs })),
      [api, experimentId],
    ),
    options,
  );
};
