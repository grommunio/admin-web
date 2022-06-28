// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Fragment, PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl,
  Button, DialogActions, Grid, FormLabel, RadioGroup, Radio, FormControlLabel, Checkbox, List,
  ListItem, ListItemText, ListItemButton, Divider, MenuItem, InputLabel, Select, 
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addOwnerData, setFolderPermissions } from '../../actions/folders';
import AddOwner from './AddOwner';
import RemoveOwner from './RemoveOwner';
import { permissionProfiles } from '../../mapi/rights';

const styles = theme => ({
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  radio: {
    padding: '2px 9px',
  },
  list: {
    border: '1px solid black',
    marginBottom: 8,
    padding: 0,
    maxHeight: 170,
    overflowY: 'auto',
  },
  addUserRow: {
    marginBottom: 32,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  noOwnersContainer: {
    display: 'flex',
    border: '1px solid black',
    justifyContent: 'center',
    marginBottom: 8,
    padding: 8,
  },
});

class FolderPermissions extends PureComponent {

  state = {
    adding: false,
    deleting: false,
    autocompleteInput: '',
    permissions: 0,
    selected: null,
  }

  handleEnter = () => {
    const { owners } = this.props;
    if(owners.length > 0) {
      this.setState({
        selected: owners[0],
        permissions: owners[0].permissions,
      });
    }
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleAddingCancel = () => this.setState({ adding: false });

  handlePermissions = e => {
    const value = parseInt(e.target.value); // Input value (1 bit is 1, rest 0)
    const mask = this.state.permissions ^ (value || 1); // Toggle nth bit or at least the 0th
    this.setState({
      permissions: mask,
    });
  }

  handleRadioPermissions = e => {
    const { value } = e.target;
    let mask = this.state.permissions;
    const intValue = parseInt(value);
    switch (intValue) {
      case 0x10: {
        mask = (mask ^ intValue) & ~(0x40); // Uncheck other radio buttons
        break;
      }
      case 0x40: {
        mask = (mask ^ intValue) & ~(0x10);
        break;
      }
      default:
        mask &= ~(0x50);
        break;
    }
    this.setState({ permissions: mask });
  }

  handleUserSelect = user => () => {
    this.setState({ selected: user, permissions: user.permissions });
  }

  handleSave = () => {
    const { domain, folderID, save, onSuccess, onError } = this.props;
    const { selected, permissions } = this.state;
    save(domain.ID, folderID, selected.memberID, { permissions })
      .then(onSuccess)
      .catch(onError);
  }

  handleDelete = () => this.setState({ deleting: true });

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleProfileSelect = e => this.setState({ permissions: e.target.value });

  render() {
    const { classes, t, open, onCancel, owners, domain, folderID } = this.props;
    const { permissions, selected, adding, deleting } = this.state;

    return (
      <Dialog
        onClose={onCancel}
        open={open}
        maxWidth="sm"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}
      >
        <DialogTitle>{t('Permissions')}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          {owners.length > 0 ? <List className={classes.list}>
            {owners.map((user, idx) => <Fragment key={idx}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={user.memberID === selected?.memberID}
                  component="a"
                  onClick={this.handleUserSelect(user)}
                >
                  <ListItemText primary={user.username}/>
                </ListItemButton>
              </ListItem> 
              <Divider />
            </Fragment>)}
          </List> : <div className={classes.noOwnersContainer}>
            <em>{t('No owners')}</em>
          </div>}
          <div className={classes.addUserRow}>
            <Button
              onClick={this.handleDelete}
              style={{ marginRight: 8 }}
              color="secondary"
            >
              {t('Remove owner')}
            </Button>
            <Button
              onClick={this.handleAdd}
              variant="contained"
              color="primary"
            >
              {t('Add owner')}
            </Button>
          </div>
          <FormControl fullWidth style={{ marginBottom: 4 }}>
            <InputLabel>{t('Profile')}</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              value={permissionProfiles.findIndex(profile => profile.value === permissions) === -1 ? "" : permissions}
              label={t('Profile')}
              onChange={this.handleProfileSelect}
            >
              {permissionProfiles.map((profile, idx) =>
                <MenuItem key={idx} value={profile.value}>
                  {profile.name}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Grid container>
            <Grid item xs={6}>
              <FormControl className={classes.form}>
                <FormLabel>Read</FormLabel>
                <RadioGroup defaultValue={0} value={permissions & 1} onChange={this.handlePermissions}>
                  <FormControlLabel
                    value={0x0}
                    control={<Radio size="small" className={classes.radio}/>}
                    label="None"
                  />
                  <FormControlLabel
                    value={0x1}
                    control={<Radio size="small" className={classes.radio}/>}
                    label="Full Details"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.form}>
                <FormLabel>Write</FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={0x2}
                      checked={Boolean(permissions & 0x2)}
                      onChange={this.handlePermissions}
                      className={classes.radio}
                      color="primary"
                    />
                  }
                  label={t('Create items')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      value={0x80}
                      checked={Boolean(permissions & 0x80)}
                      className={classes.radio}
                      onChange={this.handlePermissions}
                      color="primary"
                    />
                  }
                  label={t('Create subfolders')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(permissions & 0x8)}
                      value={0x8}
                      className={classes.radio}
                      onChange={this.handlePermissions}
                      color="primary"
                    />
                  }
                  label={t('Edit own')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radio}
                      checked={Boolean(permissions & 0x20)}
                      value={0x20}
                      onChange={this.handlePermissions}
                      color="primary"
                    />
                  }
                  label={t('Edit all')}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 16 }}>
            <Grid item xs={6}>
              <FormControl className={classes.form}>
                <FormLabel>Delete items</FormLabel>
                <RadioGroup
                  value={(permissions & 0x50) || true /* This is a bit janky */}
                  defaultValue={true}
                  onChange={this.handleRadioPermissions}
                >
                  <FormControlLabel
                    value={(permissions & 0x50) === 0} // Has explicit handling
                    control={<Radio size="small" className={classes.radio}/>}
                    label="None" />
                  <FormControlLabel
                    value={0x10}
                    control={<Radio size="small" className={classes.radio}/>}
                    label="Own"
                  />
                  <FormControlLabel
                    value={0x40}
                    control={<Radio size="small" className={classes.radio}/>}
                    label="All"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl className={classes.form}>
                <FormLabel>Other</FormLabel>
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radio}
                      checked={Boolean(permissions & 0x100)}
                      value={0x100}
                      onChange={this.handlePermissions}
                      color="primary"
                    />
                  }
                  label={t('Folder owner')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radio}
                      checked={Boolean(permissions & 0x200)}
                      onChange={this.handlePermissions}
                      color="primary"
                      value={0x200}
                    />
                  }
                  label={t('Folder contact')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      className={classes.radio}
                      checked={Boolean(permissions & 0x400)}
                      onChange={this.handlePermissions}
                      color="primary"
                      value={0x400}
                    />
                  }
                  label={t('Folder visible')}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onCancel}
            color="secondary"
          >
            {t('Close')}
          </Button>
          <Button
            onClick={this.handleSave}
            variant="contained"
            color="primary"
            disabled={owners.length === 0 || !selected}
          >
            {t('Save')}
          </Button>
        </DialogActions>
        <AddOwner
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          onCancel={this.handleAddingCancel}
          domain={domain}
          folderID={folderID}
        />
        {selected && <RemoveOwner
          open={deleting}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          ownerName={selected.username}
          domainID={domain.ID}
          folderID={folderID}
          memberID={selected.memberID}
        />}
      </Dialog>
    );
  }
}

FolderPermissions.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  owners: PropTypes.array.isRequired,
  folderID: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    owners: state.folders.Owners,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, folderID, owners) =>
      await dispatch(addOwnerData(domainID, folderID, owners)).catch(msg => Promise.reject(msg)),
    save: async (domainID, folderID, memberID, permissions) =>
      await dispatch(setFolderPermissions(domainID, folderID, memberID, permissions))
        .catch(msg => Promise.reject(msg)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(FolderPermissions)));
