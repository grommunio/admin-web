// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext } from 'react';
import { FormControl, Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { CapabilityContext } from '../../CapabilityContext';
import { SYSTEM_ADMIN_WRITE } from '../../constants';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { useAppSelector } from '../../store';
import { BaseRole } from '@/types/roles';
import { useTranslation } from 'react-i18next';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
}));

type RolesTabProps = {
  roles: BaseRole[];
  handleAutocomplete: (field: string) => (_: any, newVal: BaseRole[]) => void
}

const RolesTab = (props: RolesTabProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { Roles } = useAppSelector(state => state.roles);
  const { roles, handleAutocomplete } = props;
  const context = useContext(CapabilityContext);    

  return (
    <FormControl className={classes.form}>
      <Typography variant="h6" className={classes.headline}>{t('Roles')}</Typography>
      <FormControl>
        <MagnitudeAutocomplete<BaseRole>
          multiple
          disabled={!context.includes(SYSTEM_ADMIN_WRITE)}
          value={roles || []}
          filterAttribute={'name'}
          onChange={handleAutocomplete('roles')}
          options={Roles || []}
          label={t('Roles')}
          isOptionEqualToValue={(option, value) => option.ID === value.ID}
          placeholder={t("Search roles") + "..."}
          renderOption={(props, option) => (
            <li {...props} key={option.ID}>
              {option.name || option || ''}
            </li>
          )}
        />
      </FormControl>
    </FormControl>
  );
}


export default RolesTab;
