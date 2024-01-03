import React from 'react';

import DeleteModal from '~/pages/projects/components/DeleteModal';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { PipelineVersionKF } from '~/concepts/pipelines/kfTypes';

interface Props {
  isOpen: boolean;
  pipelineName: string;
  pipelineVersion: PipelineVersionKF;
  onDelete(): void;
  onClose(): void;
}

export const DeletePipelineVersionModal: React.FC<Props> = ({
  isOpen,
  pipelineName,
  pipelineVersion,
  onDelete,
  onClose,
}) => {
  const { api } = usePipelinesAPI();
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const handleDelete = React.useCallback(async () => {
    setDeleting(true);

    try {
      await api.deletePipelineVersion({}, pipelineVersion.id);
      onDelete();
    } catch (error) {
      setError(error as Error);
    }
  }, [api, onDelete, pipelineVersion.id]);

  return (
    <DeleteModal
      title="Delete pipeline version?"
      isOpen={isOpen}
      onClose={onClose}
      deleting={deleting}
      error={error}
      onDelete={handleDelete}
      submitButtonLabel="Delete"
      deleteName={pipelineVersion.name}
    >
      <b>{pipelineVersion.name}</b>, a version of your <b>{pipelineName}</b> pipeline, will be
      deleted.
    </DeleteModal>
  );
};
