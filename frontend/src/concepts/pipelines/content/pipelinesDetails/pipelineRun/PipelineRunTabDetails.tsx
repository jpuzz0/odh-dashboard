import * as React from 'react';
import { Spinner, EmptyStateVariant, EmptyState, EmptyStateHeader } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { PipelineRunKF } from '~/concepts/pipelines/kfTypes';
import {
  getPipelineCoreResourcePipelineReference,
  getRunDuration,
} from '~/concepts/pipelines/content/tables/utils';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { getProjectDisplayName } from '~/pages/projects/utils';
import { relativeDuration } from '~/utilities/time';
import {
  asTimestamp,
  DetailItem,
  isEmptyDateKF,
  renderDetailItems,
} from '~/concepts/pipelines/content/pipelinesDetails/pipelineRun/utils';
type PipelineRunTabDetailsProps = {
  pipelineRunKF?: PipelineRunKF;
  workflowName?: string;
};

const PipelineRunTabDetails: React.FC<PipelineRunTabDetailsProps> = ({
  pipelineRunKF,
  workflowName,
}) => {
  const { namespace, project } = usePipelinesAPI();
  if (!pipelineRunKF || !workflowName) {
    return (
      <EmptyState variant={EmptyStateVariant.lg} data-id="loading-empty-state">
        <Spinner size="xl" />
        <EmptyStateHeader titleText="Loading" headingLevel="h4" />
      </EmptyState>
    );
  }

  const pipelineReference = getPipelineCoreResourcePipelineReference(pipelineRunKF);
  const pipelineRef = pipelineReference
    ? [
        {
          key: 'Pipeline',
          // TODO: get the relative parent namespaced link
          value: (
            <Link to={`/pipelines/${namespace}/pipeline/view/${pipelineReference.key.id}`}>
              {pipelineReference.name}
            </Link>
          ),
        },
      ]
    : [];

  const details: DetailItem[] = [
    { key: 'Name', value: pipelineRunKF.name },
    ...pipelineRef,
    {
      key: 'Project',
      value: <Link to={`/projects/${namespace}`}>{getProjectDisplayName(project)}</Link>,
    },
    { key: 'Run ID', value: pipelineRunKF.id },
    { key: 'Workflow name', value: workflowName },
    { key: 'Created at', value: asTimestamp(new Date(pipelineRunKF.created_at)) },
    {
      key: 'Finished at',
      value: isEmptyDateKF(pipelineRunKF.finished_at)
        ? 'N/A'
        : asTimestamp(new Date(pipelineRunKF.finished_at)),
    },
    { key: 'Duration', value: relativeDuration(getRunDuration(pipelineRunKF)) },
  ];

  return <>{renderDetailItems(details)}</>;
};

export default PipelineRunTabDetails;
