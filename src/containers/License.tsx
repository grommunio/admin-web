// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from "react";
import { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
  Tab,
  Tabs,
  Theme,
  Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TableViewContainer from '../components/TableViewContainer';
import { fetchDomainData } from '../actions/domains';
import { DesignServices, Update } from '@mui/icons-material';
import { fetchUserCount } from '../actions/users';
import moment from 'moment'
import LicenseIcon from '../components/LicenseIcon';
import LicenseTab from '../components/license/LicenseTab';
import Design from '../components/license/Design';
import Updater from '../components/license/Updater';
import { useAppDispatch, useAppSelector } from '../store';
import { Domain } from '@/types/domains';


const useStyles = makeStyles()((theme: Theme) => ({
  about: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(0, 2),
    flex: 1,
    justifyContent: 'flex-end',
  },
}));

const IconTab = ({...tabProps}: any) => {
  return <Tab {...tabProps} sx={{ minHeight: 48 }} iconPosition='start' />
}

const License = () => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { Domains } = useAppSelector(state => state.domains);
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    snackbar: '',
    counts: {},
    loading: true,
    tab: 0,
    tabsDisabled: false,
  });

  useEffect(() => {
    const inner = async () => {
      dispatch(fetchDomainData({ sort: 'domainname,asc', level: 0, limit: 10000000 }))
        .catch(snackbar => setState({ ...state, snackbar, loading: false }));
    }

    inner();
  }, []);

  useEffect(() => {
    const inner = async () => {
      const counts = {};
      // Get user count of domains
      Domains.forEach(async (domain: Domain) => counts[domain.domainname] = await dispatch(fetchUserCount(domain.ID)));
      setState({
        ...state,
        loading: false,
        counts,
      });
    };

    inner();
  }, [Domains]);

  const handleTab = (_: never, tab: number) => {
    setState({ ...state, tab });
  }

  const setSnackbar = (snackbar: string) => setState({ ...state, snackbar });

  const setTabsDisabled = (tabsDisabled: boolean) => setState({ ...state, tabsDisabled });

  const { tab, snackbar, loading, counts, tabsDisabled } = state;

  return (
    <TableViewContainer
      headline={t("grommunio settings")}
      subtitle={t('license_sub') /* TODO: Add grommunio settings description */ }
      href="https://docs.grommunio.com/admin/administration.html#license"
      snackbar={snackbar}
      onSnackbarClose={() => setState({ ...state, snackbar: '' })}
      loading={loading}
    >
      <Tabs value={tab} onChange={handleTab} sx={{ ml: 1 }}>
        <IconTab disabled={tabsDisabled} label={t("License")} icon={<LicenseIcon />}/>
        <IconTab
          icon={<DesignServices />}
          label={t("Design")}
          disabled={tabsDisabled}
        />
        <IconTab label={t("Updates")} icon={<Update />}/>
      </Tabs>
      {tab === 0 && <LicenseTab counts={counts} setSnackbar={setSnackbar}/>}
      {tab === 1 && <Design />}
      {tab === 2 && <Updater setSnackbar={setSnackbar} setTabsDisabled={setTabsDisabled}/>}
      <div className={classes.about}>
        <Typography variant="caption">
          grommunio is Copyright © 2020-{moment().year()}. All rights reserved.
        </Typography>
        <Typography variant="caption">
          grommunio is licensed under the GNU Affero General Public License v3.
        </Typography>
        <Typography variant="caption">
          This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
        </Typography>
        <Typography variant="caption">
          This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
        </Typography>
        <Typography variant="caption">
          You should have received a copy of the GNU Affero General Public License along with this program. If not, see <a href="https://www.gnu.org/licenses/">https://www.gnu.org/licenses/</a>.
        </Typography>
      </div>
    </TableViewContainer>
  );
}


export default License;
