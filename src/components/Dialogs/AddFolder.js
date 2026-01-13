// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { withStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress,
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addFolderData, addOwnerData } from '../../actions/folders';
import { fetchUsersData } from '../../actions/users';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';
import { folderTypes } from '../../constants';

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

const AddFolder = props => {
  const [folder, setFolder] = useState({
    displayname: '',
    container: 'IPF.Note',
    owners: [],
    comment: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    props.fetchUsers(props.domain.ID)
      .catch();
  }, []);

  const handleInput = field => event => {
    setFolder({
      ...folder,
      [field]: event.target.value,
    });
  }

  const handleAdd = e => {
    e.preventDefault();
    const { add, onSuccess, onError, domain, parentID } = props;
    setLoading(true);
    add(domain.ID, {...folder, parentID})
      .then(() => {
        setFolder({
          displayname: '',
          container: 'IPF.Note',
          owners: [],
          comment: '',
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
    setFolder({
      ...folder,
      [field]: newVal,
    });
  }

  const { classes, t, open, onClose, Users } = props;
  const { displayname, owners, container, comment } = folder;
  return (
    <Dialog
      onClose={onClose}
      open={open}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('addHeadline', { item: 'Folder' })}</DialogTitle>
      <DialogContent style={{ minWidth: 400 }}>
        <FormControl className={classes.form}>
          <TextField 
            label={t("Folder name")}
            value={displayname}
            onChange={handleInput('displayname')}
            className={classes.input}
            autoFocus
            required
          />
          <TextField
            select
            className={classes.input}
            label={t("Container")}
            fullWidth
            value={container || ''}
            onChange={handleInput('container')}
          >
            {folderTypes.map((type, key) => (
              <MenuItem key={key} value={type.ID}>
                {t(type.name)}
              </MenuItem>
            ))}
          </TextField>
          <TextField 
            className={classes.input} 
            label={t("Comment")} 
            fullWidth
            multiline
            rows={4}
            value={comment}
            variant="outlined"
            onChange={handleInput('comment')}
          />
          <MagnitudeAutocomplete
            multiple
            value={owners || []}
            filterAttribute={'username'}
            onChange={handleAutocomplete('owners')}
            className={classes.input} 
            options={Users || []}
            label={t('Owners')}
            placeholder={t("Search domains")  + "..."}
            getOptionKey={(option) => `${option.ID}_${option.domainID}`}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          disabled={!displayname || loading}
          type="submit"
        >
          {loading ? <CircularProgress size={24}/> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AddFolder.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  Users: PropTypes.array.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  parentID: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    Users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folder) => {
      await dispatch(addFolderData(domainID, folder)).catch(msg => Promise.reject(msg));
    },
    addOwner: async (domainID, folderID, username) => {
      await dispatch(addOwnerData(domainID, folderID, username)).catch(msg => Promise.reject(msg));
    },
    fetchUsers: async (domainID) =>
      await dispatch(fetchUsersData(domainID, { limit: 100000, sort: "username,asc" }))
        .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(AddFolder, styles)));
