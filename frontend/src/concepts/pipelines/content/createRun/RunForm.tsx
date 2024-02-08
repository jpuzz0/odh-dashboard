import * as React from 'react';
import { Form, FormGroup, FormSection, Text } from '@patternfly/react-core';
import NameDescriptionField from '~/concepts/k8s/NameDescriptionField';
import { RunFormData } from '~/concepts/pipelines/content/createRun/types';
import { ValueOf } from '~/typeHelpers';
import RunTypeSection from '~/concepts/pipelines/content/createRun/contentSections/RunTypeSection';
import ParamsSection from '~/concepts/pipelines/content/createRun/contentSections/ParamsSection';
import { getProjectDisplayName } from '~/pages/projects/utils';
import PipelineVersionSection from '~/concepts/pipelines/content/createRun/contentSections/PipelineVersionSection';
import { useLatestPipelineVersion } from '~/concepts/pipelines/apiHooks/useLatestPipelineVersion';
import { PipelineVersionKFv2 } from '~/concepts/pipelines/kfTypes';
import PipelineSection from './contentSections/PipelineSection';
import { CreateRunPageSections, runPageSectionTitles } from './const';

type RunFormProps = {
  data: RunFormData;
  onValueChange: (key: keyof RunFormData, value: ValueOf<RunFormData>) => void;
};

const RunForm: React.FC<RunFormProps> = ({ data, onValueChange }) => {
  const [latestVersion] = useLatestPipelineVersion(data.pipeline?.pipeline_id);

  const updateInputParams = React.useCallback(
    (version: PipelineVersionKFv2 | undefined) =>
      onValueChange(
        'params',
        Object.keys(version?.pipeline_spec?.root?.inputDefinitions?.parameters || {}).reduce(
          (acc: Record<string, unknown>, parameter) => {
            acc[parameter] = data.params?.[parameter] ?? '';
            return acc;
          },
          {},
        ),
      ),
    [data.params, onValueChange],
  );

  React.useEffect(() => {
    if (latestVersion) {
      onValueChange('version', latestVersion);
      updateInputParams(latestVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestVersion]);

  return (
    <Form
      maxWidth="500px"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection id="run-section-project-name" title="Project">
        <FormGroup label="Project">
          <Text>{getProjectDisplayName(data.project)}</Text>
        </FormGroup>
      </FormSection>
      <FormSection
        id={CreateRunPageSections.NAME_DESC}
        aria-label={runPageSectionTitles[CreateRunPageSections.NAME_DESC]}
      >
        <NameDescriptionField
          nameFieldId="run-name"
          descriptionFieldId="run-description"
          data={data.nameDesc}
          setData={(nameDesc) => onValueChange('nameDesc', nameDesc)}
        />
      </FormSection>
      <PipelineSection
        value={data.pipeline}
        onChange={async (pipeline) => {
          onValueChange('pipeline', pipeline);
          onValueChange('version', undefined);
        }}
      />
      <PipelineVersionSection
        selectedPipeline={data.pipeline}
        value={data.version || latestVersion}
        onChange={(version) => {
          onValueChange('version', version);
          updateInputParams(version);
        }}
      />
      <RunTypeSection
        value={data.runType}
        onChange={(runType) => onValueChange('runType', runType)}
      />
      <ParamsSection
        runParams={data.params}
        versionId={data.version?.pipeline_version_id || latestVersion?.pipeline_version_id}
        onChange={(params) => onValueChange('params', params)}
      />
    </Form>
  );
};

export default RunForm;
