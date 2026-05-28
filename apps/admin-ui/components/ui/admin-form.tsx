'use client';

import { useAdminToast } from '@/components/ui/admin-toast';
import * as React from 'react';
import { useState } from 'react';
import {
  Alert,
  AlertContent,
  Button,
  Card,
  CardContent,
  FormActions,
  FormControl,
  FormErrorMessage,
  FormField,
  FormHelperText,
  FormLabel,
  Flex,
  FormLayout,
  Grid,
  PageSection,
  Stack,
  Textarea,
  type FormFieldProps,
  type FormLayoutProps,
} from '@shared-ui';
import { FormErrorAlert, FormSuccessAlert, useFormFieldValidation } from '@/components/ui/admin-form-validation';
import { getErrorMessage } from '@/lib/utils';

export {
  Alert,
  AlertContent,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormActions,
  FormControl,
  FormErrorMessage,
  Flex,
  FormField,
  FormHelperText,
  FormLabel,
  FormLayout,
  Grid,
  Input,
  Radio,
  RadioGroup,
  Select,
  PageSection,
  Stack,
  Switch,
  Textarea,
  type FormFieldProps,
  type FormLayoutProps,
} from '@shared-ui';
export {
  FormErrorAlert,
  FormSuccessAlert,
  useFormFieldValidation,
} from '@/components/ui/admin-form-validation';
/** @deprecated Use `FormErrorMessage` or `FormErrorAlert`. */
export { ErrorText } from '@shared-ui';
/** @deprecated Use `FormHelperText` inside `FormField`. */
export { HelperText } from '@shared-ui';

export type SettingsSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave: () => Promise<void>;
  saveLabel?: string;
};

/** ODS settings block — PageSection, Card, FormLayout spacing, save action. */
export function SettingsSection({
  title,
  description,
  children,
  onSave,
  saveLabel = 'Save',
}: SettingsSectionProps) {
  const { success: toastSuccess, error: toastError } = useAdminToast();
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      await onSave();
      toastSuccess('Saved');
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageSection title={title} description={description}>
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <FormLayout>
            {children}
            <FormActions>
              <Button type="button" onClick={save} isLoading={loading} loadingLabel="Saving…">
                {saveLabel}
              </Button>
            </FormActions>
          </FormLayout>
        </CardContent>
      </Card>
    </PageSection>
  );
}

export type JsonEditorFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  helper?: string;
};

export function JsonEditorField({ value, onChange, label, id, helper }: JsonEditorFieldProps) {
  return (
    <FormField label={label} htmlFor={id} helper={helper ?? 'JSON configuration for this section.'}>
      <Textarea
        id={id}
        className="min-h-32 font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </FormField>
  );
}

export {
  ConfirmDialog,
  ConfirmModal,
  DeleteConfirmDialog,
  DisableConfirmDialog,
  FormDialog,
  FormModal,
  DialogFooterActions,
  useConfirmAction,
  type ConfirmDialogProps,
  type ConfirmModalProps,
  type FormDialogProps,
  type FormModalProps,
} from '@/components/ui/admin-dialog';
