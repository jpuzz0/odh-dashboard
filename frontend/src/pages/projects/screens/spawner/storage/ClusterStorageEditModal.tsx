import React from 'react';

import {
  Alert,
  Form,
  FormGroup,
  Modal,
  ModalVariant,
  TextArea,
  TextInput,
} from '@patternfly/react-core';

import DashboardModalFooter from '~/concepts/dashboard/DashboardModalFooter';
import PVSizeField from '~/pages/projects/components/PVSizeField';
import { StorageData } from '~/pages/projects/types';
import StorageClassSelect from './StorageClassSelect';
import SpawnerMountPathField from './SpawnerMountPathField';

interface ClusterStorageEditModalProps {
  storageData: StorageData;
  onUpdate: (storageData: StorageData) => void;
  onClose: () => void;
  isDefault?: boolean;
}

export const ClusterStorageEditModal: React.FC<ClusterStorageEditModalProps> = ({
  storageData,
  onUpdate,
  onClose,
  isDefault,
}) => {
  const [name, setName] = React.useState(storageData.name);
  const [description, setDescription] = React.useState(storageData.description);
  const [size, setSize] = React.useState(storageData.size);
  const [storageClassName, setStorageClassName] = React.useState(storageData.storageClassName);
  const [mountPath, setMountPath] = React.useState(storageData.mountPath);

  const onSubmit = () => {
    onUpdate({
      ...storageData,
      name,
      description,
      size,
      storageClassName,
      mountPath,
    });
    onClose();
  };

  return (
    <Modal
      isOpen
      variant={ModalVariant.small}
      title="Edit storage"
      onClose={onClose}
      footer={
        <DashboardModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          submitLabel="Save"
          isSubmitDisabled={!name}
          alertTitle="Error updating storage class"
        />
      }
      data-testid="edit-cluster-storage-modal"
    >
      <Form id="edit-cluster-storage-form">
        <Alert
          variant="info"
          isInline
          title={
            <>
              This cluster storage will mount to the root path{' '}
              <span style={{ fontWeight: 'lighter' }}>/opt/app-root/src/</span>
            </>
          }
        />
        <FormGroup label="Display name" fieldId="name" isRequired>
          <TextInput
            isRequired
            value={name}
            onChange={(_, value) => setName(value)}
            id="display-name"
            data-testid="display-name-input"
          />
        </FormGroup>
        <FormGroup label="Description" fieldId="description">
          <TextArea
            value={description}
            onChange={(_, value) => setDescription(value)}
            resizeOrientation="vertical"
            autoResize
            id="description"
            data-testid="description-textarea"
          />
        </FormGroup>
        <StorageClassSelect
          storageClassName={storageClassName}
          setStorageClassName={(newName) => setStorageClassName(newName)}
        />
        <PVSizeField
          fieldID="storage-size"
          size={size}
          setSize={(storageSize) => setSize(storageSize)}
        />

        <SpawnerMountPathField
          isCreate={!isDefault}
          inUseMountPaths={[]}
          mountPath={mountPath ?? ''}
          onChange={(value) => setMountPath(value)}
        />
      </Form>
    </Modal>
  );
};
