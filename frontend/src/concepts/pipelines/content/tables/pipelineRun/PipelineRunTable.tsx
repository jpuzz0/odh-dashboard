import * as React from 'react';
import { TableVariant } from '@patternfly/react-table';
import { TableBase } from '~/components/table';
import { PipelineCoreResourceKF, PipelineRunKF } from '~/concepts/pipelines/kfTypes';
import { pipelineRunColumns } from '~/concepts/pipelines/content/tables/columns';
import PipelineRunTableRow from '~/concepts/pipelines/content/tables/pipelineRun/PipelineRunTableRow';
import { useCheckboxTable } from '~/components/table';
import EmptyTableView from '~/concepts/pipelines/content/tables/EmptyTableView';
import PipelineRunTableToolbar from '~/concepts/pipelines/content/tables/pipelineRun/PipelineRunTableToolbar';
import { DeletePipelineCoreResourceModal } from '~/concepts/pipelines/content/delete';
import { usePipelinesAPI } from '~/concepts/pipelines/context';
import { PipelineType } from '~/concepts/pipelines/content/tables/utils';
import { PipelinesFilter } from '~/concepts/pipelines/types';
import usePipelineFilter from '~/concepts/pipelines/content/tables/usePipelineFilter';

type PipelineRunTableProps = {
  runs: PipelineRunKF[];
  loading?: boolean;
  totalSize: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  setSortField: (field: string) => void;
  setSortDirection: (dir: 'asc' | 'desc') => void;
  setFilter: (filter?: PipelinesFilter) => void;
};

const PipelineRunTable: React.FC<PipelineRunTableProps> = ({
  runs,
  loading,
  totalSize,
  page,
  pageSize,
  setPage,
  setPageSize,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  setFilter,
}) => {
  const { refreshAllAPI, getJobInformation } = usePipelinesAPI();
  const filterToolbarProps = usePipelineFilter(setFilter);
  const { selections, tableProps, toggleSelection, isSelected } = useCheckboxTable(
    runs.map(({ id }) => id),
  );
  const [deleteResources, setDeleteResources] = React.useState<PipelineCoreResourceKF[]>([]);

  return (
    <>
      <TableBase
        {...tableProps}
        loading={loading}
        page={page}
        perPage={pageSize}
        onSetPage={(_, newPage) => {
          if (newPage < page || !loading) {
            setPage(newPage);
          }
        }}
        onPerPageSelect={(_, newSize) => setPageSize(newSize)}
        itemCount={totalSize}
        data={runs}
        columns={pipelineRunColumns}
        enablePagination="compact"
        emptyTableView={<EmptyTableView onClearFilters={filterToolbarProps.onClearFilters} />}
        toolbarContent={
          <PipelineRunTableToolbar
            {...filterToolbarProps}
            deleteAllEnabled={selections.length > 0}
            onDeleteAll={() =>
              setDeleteResources(
                selections
                  .map<PipelineCoreResourceKF | undefined>((selection) =>
                    runs.find(({ id }) => id === selection),
                  )
                  .filter((v): v is PipelineCoreResourceKF => !!v),
              )
            }
          />
        }
        rowRenderer={(run) => (
          <PipelineRunTableRow
            key={run.id}
            isChecked={isSelected(run.id)}
            onToggleCheck={() => toggleSelection(run.id)}
            onDelete={() => setDeleteResources([run])}
            run={run}
            getJobInformation={getJobInformation}
          />
        )}
        variant={TableVariant.compact}
        getColumnSort={(columnIndex) =>
          pipelineRunColumns[columnIndex].sortable
            ? {
                sortBy: {
                  index: pipelineRunColumns.findIndex((c) => c.field === sortField),
                  direction: sortDirection,
                  defaultDirection: 'asc',
                },
                onSort: (_event, index, direction) => {
                  setSortField(String(pipelineRunColumns[index].field));
                  setSortDirection(direction);
                },
                columnIndex,
              }
            : undefined
        }
      />
      <DeletePipelineCoreResourceModal
        toDeleteResources={deleteResources}
        type={PipelineType.TRIGGERED_RUN}
        onClose={(deleted) => {
          if (deleted) {
            refreshAllAPI();
          }
          setDeleteResources([]);
        }}
      />
    </>
  );
};

export default PipelineRunTable;
