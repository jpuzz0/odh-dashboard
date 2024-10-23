import { Form, Modal, Stack, StackItem } from '@patternfly/react-core';
import React from 'react';
import { StorageData } from '~/pages/projects/types';
import DashboardModalFooter from '~/concepts/dashboard/DashboardModalFooter';
import AddExistingStorageField from './AddExistingStorageField';
import SpawnerMountPathField from './SpawnerMountPathField';

type AttachExistingStorageModalProps = {
  onClose: (submit: boolean, storageData?: StorageData) => void;
};

const storageDataInitialState: StorageData = {
  name: '',
  size: '',
  mountPath: '',
};

const AttachExistingStorageModal: React.FC<AttachExistingStorageModalProps> = ({ onClose }) => {
  const [data, setData] = React.useState<StorageData>(storageDataInitialState);
  const [createEnabled, setCreateEnabled] = React.useState(false);

  React.useEffect(() => {
    setCreateEnabled(data.name !== '' && data.size !== '' && data.mountPath !== '');
  }, [data]);

  const onBeforeClose = (submitted: boolean, storageData?: StorageData) => {
    onClose(submitted, storageData);
    setData(storageDataInitialState);
  };

  return (
    <Modal
      title="Attach Existing Storage"
      variant="medium"
      onClose={() => onBeforeClose(false)}
      showClose
      isOpen
      footer={
        <DashboardModalFooter
          submitLabel="Attach storage"
          onSubmit={() => onBeforeClose(true, data)}
          onCancel={() => onBeforeClose(false)}
          isSubmitDisabled={!createEnabled}
          alertTitle="Error creating storage"
        />
      }
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onBeforeClose(true, data);
        }}
      >
        <Stack hasGutter>
          <StackItem>
            <AddExistingStorageField data={data} setData={setData} />
          </StackItem>
          <StackItem>
            <SpawnerMountPathField
              isCreate
              mountPath={data.mountPath || ''}
              onChange={(path: string) => setData({ ...data, mountPath: path })}
            />
          </StackItem>
        </Stack>
      </Form>
    </Modal>
  );
};

export default AttachExistingStorageModal;
