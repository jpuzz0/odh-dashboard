import { PersistentVolumeClaimKind, StorageClassKind } from '~/k8sTypes';
import { ForNotebookSelection } from '~/pages/projects/types';

export type StorageTableData = {
  pvc: PersistentVolumeClaimKind;
  storageClass: StorageClassKind | undefined;
};

export type StorageFormData = {
  nameDesc: {
    name: string;
    description: string;
  };
  size: string;
  storageClassName: string;
  mountPath?: string;
  forNotebook: ForNotebookSelection;
  hasExistingNotebookConnections?: boolean;
};

export type CreatingStorageObjectForNotebook = {
  nameDesc: {
    name: string;
    description: string;
  };
  size: string;
  storageClassName: string;
  mountPath?: string;
  forNotebook: ForNotebookSelection;
  hasExistingNotebookConnections?: boolean;
};
