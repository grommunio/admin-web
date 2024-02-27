// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addOrgData } from '../../actions/orgs';
import { fetchDomainData } from '../../actions/domains';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
});

const AddOrg = props => {
  const [org, setOrg] = useState({
    name: '',
    description: '',
    domains: [],
  });
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    props.fetch();
  }

  const handleInput = field => event => {
    setOrg({
      ...org,
      [field]: event.target.value,
    });
  }

  const handleAdd = () => {
    const { add, onSuccess, onError } = props;
    const { name, description, domains } = org;
    setLoading(true);
    add({
      name,
      description,
      domains: domains.map(d => d.ID),
    })
      .then(() => {
        setOrg({
          name: '',
          description: '',
          domains: [],
        });
        setLoading(false);
        onSuccess();
      })
      .catch(error => {
        onError(error);
        setLoading(false);
      });
  }

  const handleAutocomplete = (field) => (e, newVal) => {
    setOrg({
      ...org,
      [field]: newVal,
    });
  }

  const { classes, t, open, onClose, Domains } = props;
  const { name, description, domains } = org;
  const nameAcceptable = name.length < 33;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEnter: handleEnter,
      }}>
      <DialogTitle>{t('addHeadline', { item: 'Organization' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            className={classes.input} 
            label={t("Name")} 
            fullWidth 
            value={name || ''}
            onChange={handleInput('name')}
            autoFocus
            required
            error={Boolean(name && !nameAcceptable)}
          />
          <TextField 
            className={classes.input} 
            label={t("Description")} 
            fullWidth 
            value={description || ''}
            onChange={handleInput('description')}
            multiline
            rows={4}
            variant="outlined"
          />
          <MagnitudeAutocomplete
            value={domains || []}
            filterAttribute={'domainname'}
            onChange={handleAutocomplete('domains')}
            className={classes.input} 
            options={Domains || []}
            label={t('Domains')}
            placeholder={t("Search domains") + "..."}
            multiple
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={loading || !nameAcceptable}
        >
          {loading ? <CircularProgress size={24}/> : t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddOrg.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  Domains: PropTypes.array.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    Domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () =>
      await dispatch(fetchDomainData({ sort: 'domainname,asc' })),
    add: async org => {
      await dispatch(addOrgData(org))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddOrg)));
