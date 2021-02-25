// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020 grammm GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  MenuItem, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addMListData } from '../../actions/mlists';

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

class AddMList extends PureComponent {

  state = {
    listname: '',
    listType: 0,
    listPrivilege: 0,
    associations: '',
    specifieds: '',
    loading: false,
  }

  listTypes = [
    { ID: 0, name: "Normal" },
    { ID: 1, name: "Group" },
    { ID: 2, name: "Domain" },
  ]

  listPrivileges = [
    { ID: 0, name: "All" },
    { ID: 1, name: "Internal" },
    { ID: 2, name: "Domain" },
    { ID: 3, name: "Specific" },
    { ID: 4, name: "Outgoing" },
  ]

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleTypeChange = event => {
    const { associations } = this.state;
    const val = event.target.value;
    this.setState({
      listType: val,
      associations: val === 0 ? associations : '', /* Associations only available if type "all" */
    });
  }

  handlePrivilegeChange = event => {
    const { specifieds } = this.state;
    const val = event.target.value;
    this.setState({
      listPrivilege: val,
      specifieds: val === 3 ? specifieds : '', /* Specifieds only available if privilege "specific" */
    });
  }

  handleAdd = () => {
    const { add, domain, onSuccess, onError } = this.props;
    const { listname, listType, listPrivilege, associations, specifieds } = this.state;
    this.setState({ loading: true });
    add(domain.ID, {
      listname,
      listType,
      listPrivilege,
      /* Strip whitespaces and split on ',' */
      associations: associations ? associations.replace(/\s/g, "").split(',') : undefined, 
      specifieds: specifieds ? specifieds.replace(/\s/g, "").split(',') : undefined,
    })
      .then(() => {
        this.setState({
          listname: '',
          listType: 0,
          listPrivilege: 0,
          associations: '',
          specifieds: '',
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, open, onClose } = this.props;
    const { listname, listType, listPrivilege, associations, specifieds, loading } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'Mail list' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Mail list name")} 
              fullWidth 
              value={listname || ''}
              onChange={this.handleInput('listname')}
              autoFocus
              required
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={listType || 0}
              onChange={this.handleTypeChange}
            >
              {this.listTypes.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              className={classes.input}
              label={t("Privilege")}
              fullWidth
              value={listPrivilege || 0}
              onChange={this.handlePrivilegeChange}
            >
              {this.listPrivileges.map((status, key) => (
                <MenuItem key={key} value={status.ID}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>
            {listType === 0 && <TextField 
              className={classes.input} 
              label={t("Recipients (separated by ',')")} 
              fullWidth 
              value={associations || ''}
              onChange={this.handleInput('associations')}
            />}
            {listPrivilege === 3 && <TextField 
              className={classes.input} 
              label={t("Senders (separated by ','")} 
              fullWidth 
              value={specifieds || ''}
              onChange={this.handleInput('specifieds')}
            />}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            variant="contained"
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !listname}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddMList.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  domain: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, mList) => {
      await dispatch(addMListData(domainID, mList))
        .catch(message => Promise.reject(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddMList)));
