import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
} from '@patternfly/react-core/deprecated';

import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { DeletePipelineVersionModal } from '~/concepts/pipelines/content/delete';
import PipelineVersionImportModal from '~/concepts/pipelines/content/import/PipelineVersionImportModal';
import { PipelineKF, PipelineVersionKF } from '~/concepts/pipelines/kfTypes';

type PipelineDetailsActionsProps = {
  pipeline: PipelineKF | null;
  pipelineVersion: PipelineVersionKF | null;
};

const PipelineDetailsActions: React.FC<PipelineDetailsActionsProps> = ({
  pipeline,
  pipelineVersion,
}) => {
  const navigate = useNavigate();
  const { namespace } = usePipelinesAPI();
  const [open, setOpen] = React.useState(false);
  const [isVersionImportModalOpen, setIsVersionImportModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const hasPipelineAndVersion = pipeline && pipelineVersion;

  return (
    <>
      <Dropdown
        onSelect={() => setOpen(false)}
        toggle={
          <DropdownToggle
            toggleVariant="primary"
            onToggle={() => setOpen(!open)}
            isDisabled={!hasPipelineAndVersion}
          >
            Actions
          </DropdownToggle>
        }
        isOpen={open}
        position="right"
        dropdownItems={[
          <DropdownItem key="upload-version" onClick={() => setIsVersionImportModalOpen(true)}>
            Upload new version
          </DropdownItem>,
          <DropdownSeparator key="separator-1" />,
          <DropdownItem
            key="create-run"
            onClick={() =>
              navigate(`/pipelineRuns/${namespace}/pipelineRun/create`, {
                state: { lastPipeline: pipeline, lastVersion: pipelineVersion },
              })
            }
          >
            Create run
          </DropdownItem>,
          <DropdownItem key="view-runs" onClick={() => navigate(`/pipelineRuns/${namespace}`)}>
            View runs
          </DropdownItem>,
          <DropdownSeparator key="separator-2" />,
          <DropdownItem key="delete" onClick={() => setIsDeleteModalOpen(true)}>
            Delete
          </DropdownItem>,
        ]}
      />

      <PipelineVersionImportModal
        existingPipeline={pipeline}
        isOpen={isVersionImportModalOpen}
        onClose={(pipelineVersion) => {
          setIsVersionImportModalOpen(false);

          if (pipelineVersion) {
            navigate(`/pipelines/${namespace}/pipeline/view/${pipelineVersion.id}`);
          }
        }}
      />

      {hasPipelineAndVersion && (
        <DeletePipelineVersionModal
          isOpen={isDeleteModalOpen}
          pipelineName={pipeline.name}
          pipelineVersion={pipelineVersion}
          onDelete={() => navigate(`/pipelines/${namespace}`)}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </>
  );
};

export default PipelineDetailsActions;
