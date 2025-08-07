// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import {
  Tab,
  Tabs,
  Typography } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { uploadLicenseData } from '../actions/license';
import { connect } from 'react-redux';
import TableViewContainer from '../components/TableViewContainer';
import { fetchDomainData } from '../actions/domains';
import { DesignServices, Update } from '@mui/icons-material';
import { fetchPlainUsersData, fetchUserCount } from '../actions/users';
import moment from 'moment'
import LicenseIcon from '../components/LicenseIcon';
import { systemUpdate } from '../actions/misc';
import { fetchUpdateLogData } from '../actions/logs';
import LicenseTab from '../components/license/LicenseTab';
import Design from '../components/license/Design';
import Updater from '../components/license/Updater';
import { USER_STATUS } from '../constants';


const styles = theme => ({
  about: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(0, 2),
    flex: 1,
    justifyContent: 'flex-end',
  },
});

const IconTab = ({...tabProps}) => {
  return <Tab {...tabProps} sx={{ minHeight: 48 }} iconPosition='start' />
}

const License = props => {
  const [state, setState] = useState({
    snackbar: '',
    counts: {},
    loading: true,
    tab: 0,
    tabsDisabled: false,
  });

  useEffect(() => {
    const inner = async () => {
      props.fetchDomains()
        .catch(snackbar => setState({ ...state, snackbar, loading: false }));
    }

    inner();
  }, []);

  useEffect(() => {
    const inner = async () => {
      const { Domains, fetchCount } = props;
      const counts = {};
      // Get user count of domains
      Domains.forEach(async domain => counts[domain.domainname] = await fetchCount(domain.ID));
      setState({
        ...state,
        loading: false,
        counts,
      });
    };

    inner();
  }, [props.Domains]);

  const handleTab = (e, tab) => {
    setState({ ...state, tab });
  }

  const setSnackbar = snackbar => setState({ ...state, snackbar });

  const setTabsDisabled = tabsDisabled => setState({ ...state, tabsDisabled });

  const { classes, t } = props;
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

License.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  license: PropTypes.object.isRequired,
  upload: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  fetchCount: PropTypes.func.isRequired,
  fetchLog: PropTypes.func.isRequired,
  systemUpdate: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  customImages: PropTypes.object,
};

const mapStateToProps = state => {
  const { license, domains, config } = state;
  return {
    license: license,
    Domains: domains.Domains,
    customImages: config.customImages,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchDomains: async () => {
      await dispatch(fetchDomainData({ sort: 'domainname,asc', level: 0, limit: 10000 }))
        .catch(error => Promise.reject(error));
    },
    fetchCount: async domainID => await dispatch(fetchUserCount(domainID))
      .catch(error => Promise.reject(error)),
    fetchUsers: async (domainID) => 
      await dispatch(fetchPlainUsersData(domainID, { status: USER_STATUS.NORMAL }))
        .catch(error => Promise.reject(error)),
    upload: async license => await dispatch(uploadLicenseData(license))
      .catch(err => Promise.reject(err)),
    systemUpdate: async action => await dispatch(systemUpdate(action))
      .catch(err => Promise.reject(err)),
    fetchLog: async (pid) =>
      await dispatch(fetchUpdateLogData(pid))
        .catch(error => Promise.reject(error)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(License, styles)));
