// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControl, FormControlLabel,
  Slider, SliderTypeMap, TextField, TextFieldVariants, Theme, Typography } from '@mui/material';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    margin: '12px 0px 0px 8px',
  },
  slider: {
    maxWidth: 400,
  },
  gridTf: {
    flex: 1,
    margin: theme.spacing(0, 1, 1, 0),
  },
  header: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  radio: {
    marginTop: 8,
  },
  blueCheckbox: {
    color: theme.palette.primary['500'],
  },
}));


type SyncPoliciesProps = {
  syncPolicy: any; // TODO Properly type sync policies
  defaultPolicy: any; // TODO Properly type sync policies
  handleChange: (field: string) => (() => void);
  handleSlider: (field: string) => (() => void);
  handleCheckbox: (field: string) => (() => void);
}

const SyncPolicies = (props: SyncPoliciesProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation()
  const { syncPolicy, defaultPolicy, handleChange, handleSlider, handleCheckbox } = props;

  const { maxdevpwfailedattempts, mindevpwlenngth, mindevcomplexchars } = syncPolicy;

  const defaultCheckboxProps = (label: string, field: string) => {
    const valueIsDefault = syncPolicy[field] === defaultPolicy[field];
    return {
      control: <Checkbox
        className={valueIsDefault ? "" : classes.blueCheckbox}
        checked={!!syncPolicy[field]}
        onChange={handleCheckbox(field)}
        color={valueIsDefault ? "default" : "primary"}
      />,
      label: t(label),
    }
  };

  const defaultTfProps = (label: string, field: string) => ({
    className: classes.slider,
    style: { marginBottom: 8 },
    label: t(label),
    value: syncPolicy[field],
    InputLabelProps: {
      className: syncPolicy[field] === defaultPolicy[field] ? "" : classes.blueCheckbox,
    },
    onChange: handleChange(field),
    variant: "standard" as TextFieldVariants
  });

  const defaultSliderProps = (field: string) => ({
    color: (syncPolicy[field] === defaultPolicy[field] ? "secondary" : "primary") as SliderTypeMap["props"]["color"],
    marks: true,
    className: classes.slider,
    onChange: handleSlider(field),
    step: 1,
    valueLabelDisplay: "auto" as SliderTypeMap["props"]["valueLabelDisplay"],
  });

  return (
    <FormControl className={classes.form}>
      <Typography variant="h6" className={classes.header}>{t('General')}</Typography>
      <FormControlLabel
        {...defaultCheckboxProps("Allow storage card", "allowstoragecard")}
      />
      <FormControlLabel
        {...defaultCheckboxProps("Require encryption on storage card", "reqstoragecardenc")}
      />
      <Typography variant="h6" className={classes.header}>{t('Passwords')}</Typography>
      <FormControlLabel
        {...defaultCheckboxProps("Password required", "devpwenabled")}
      />
      <FormControlLabel
        {...defaultCheckboxProps("Allow simple passwords", "allowsimpledevpw")}
        style={{ marginBottom: 8 }}
      />
      <div>
        <Typography gutterBottom>
          {t('Minimum password length')}
        </Typography>
        <Slider
          {...defaultSliderProps("mindevpwlenngth")}
          value={mindevpwlenngth || 4}
          min={1}
          max={16}
        />
      </div>
      <FormControlLabel
        {...defaultCheckboxProps("Require alphanumeric password", "alphanumpwreq")}
        style={{ marginBottom: 8 }}
      />
      <div>
        <Typography gutterBottom>
          {t('Minimum password character sets')}
        </Typography>
        <Slider
          {...defaultSliderProps("mindevcomplexchars")}
          value={mindevcomplexchars || 3}
          min={1}
          max={4}
        />
      </div>
      <div>
        <Typography gutterBottom>
          {t('Number of failed login attempts allowed')}
        </Typography>
        <Slider
          {...defaultSliderProps("maxdevpwfailedattempts")}
          value={maxdevpwfailedattempts || 8}
          min={4}
          max={16}
        />
      </div>
      <TextField
        {...defaultTfProps("Password expiration (days)", "devpwexpiration")}
      />
      <TextField
        {...defaultTfProps("Inactivity (seconds) before device locks itself", "maxinacttimedevlock")}
      />
      <TextField
        {...defaultTfProps("Password history", "devpwhistory")}
        style={{ marginBottom: 16 }}
      />
    </FormControl>
  );
}

export default SyncPolicies;
