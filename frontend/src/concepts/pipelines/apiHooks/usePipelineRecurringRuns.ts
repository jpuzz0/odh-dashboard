import * as React from 'react';
import { PipelineRecurringRunKFv2 } from '~/concepts/pipelines/kfTypes';
import { FetchState } from '~/utilities/useFetchState';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import usePipelineQuery from '~/concepts/pipelines/apiHooks/usePipelineQuery';
import {
  ListPipelineRecurringRuns,
  PipelineListPaged,
  PipelineRunOptions,
  PipelineRunParams,
} from '~/concepts/pipelines/types';
import { K8sAPIOptions } from '~/k8sTypes';

/**
 * Recursively fetch each recurring run page when a next_page_token exists.
 */
async function getAllRecurringRuns(
  opts: K8sAPIOptions,
  params: PipelineRunParams | undefined,
  listPipelineRecurringRuns: ListPipelineRecurringRuns,
): Promise<PipelineRecurringRunKFv2[]> {
  const result = await listPipelineRecurringRuns(opts, params);
  let allRecurringRuns = result.recurringRuns ?? [];

  if (result.next_page_token) {
    const nextRecurringRuns = await getAllRecurringRuns(
      opts,
      { ...params, pageToken: result.next_page_token },
      listPipelineRecurringRuns,
    );
    allRecurringRuns = allRecurringRuns.concat(nextRecurringRuns);
  }

  return allRecurringRuns;
}

/**
 * Fetch all recurring run pages.
 */
export const useAllPipelineRecurringRuns = (
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRecurringRunKFv2>> => {
  const { api } = usePipelinesAPI();
  const experimentId = options?.experimentId;
  const pipelineVersionId = options?.pipelineVersionId;

  return usePipelineQuery<PipelineRecurringRunKFv2>(
    React.useCallback(
      async (opts, params) => {
        const allRecurringRuns = await getAllRecurringRuns(
          opts,
          {
            ...params,
            ...(experimentId && { experimentId }),
            ...(pipelineVersionId && { pipelineVersionId }),
          },
          api.listPipelineRecurringRuns,
        );

        return { items: allRecurringRuns, totalSize: allRecurringRuns.length };
      },
      [api, experimentId, pipelineVersionId],
    ),
    options,
  );
};

const usePipelineRecurringRuns = (
  options?: PipelineRunOptions,
): FetchState<PipelineListPaged<PipelineRecurringRunKFv2>> => {
  const { api } = usePipelinesAPI();
  const experimentId = options?.experimentId;
  const pipelineVersionId = options?.pipelineVersionId;

  return usePipelineQuery<PipelineRecurringRunKFv2>(
    React.useCallback(
      (opts, params) =>
        api
          .listPipelineRecurringRuns(opts, {
            ...params,
            ...(experimentId && { experimentId }),
            ...(pipelineVersionId && { pipelineVersionId }),
          })
          .then((result) => ({ ...result, items: result.recurringRuns })),
      [api, experimentId, pipelineVersionId],
    ),
    options,
  );
};

export default usePipelineRecurringRuns;
