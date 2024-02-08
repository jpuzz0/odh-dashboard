import * as React from 'react';
import { Alert, FormGroup, FormSection, TextInput } from '@patternfly/react-core';
import {
  CreateRunPageSections,
  runPageSectionTitles,
} from '~/concepts/pipelines/content/createRun/const';

type ParamsSectionProps = {
  runParams: Record<string, unknown> | undefined;
  versionId: string | undefined;
  onChange: (params: Record<string, unknown>) => void;
};

const ParamsSection: React.FC<ParamsSectionProps> = ({ runParams = {}, versionId, onChange }) => {
  const renderContent = (): React.ReactNode => {
    if (!versionId) {
      return (
        <Alert
          variant="info"
          isInline
          isPlain
          title="You must select a pipeline and version before you can set parameters."
        />
      );
    }

    if (!Object.keys(runParams).length) {
      return <Alert variant="info" isInline isPlain title="This pipeline has no parameters." />;
    }

    return Object.entries(runParams).map(([label, value]) => (
      <FormGroup key={label} label={label} fieldId={`${label}-param-field`} isRequired>
        <TextInput
          type="text"
          isRequired
          id={`${label}-param-field`}
          name={`${label}-param-field`}
          value={String(value ?? '')}
          onChange={(_e, newParamValue) => onChange({ ...runParams, [label]: newParamValue })}
        />
      </FormGroup>
    ));
  };

  return (
    <FormSection
      id={CreateRunPageSections.PARAMS}
      title={runPageSectionTitles[CreateRunPageSections.PARAMS]}
    >
      {renderContent()}
    </FormSection>
  );
};

export default ParamsSection;
