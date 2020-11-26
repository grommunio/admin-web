import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress,
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData } from '../../actions/users';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  select: {
    minWidth: 60,
  },
});

class AddUser extends PureComponent {

  state = {
    username: '',
    properties: {
      displayname: '',
      storagequotalimit: '',
      displaytypeex: 0,
    },
    loading: false,
  }

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 7 },
    { name: 'Equipment', ID: 8 },
  ]

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({ [field]: event.target.checked });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      [field]: input,
    });
  }

  handleAdd = () => {
    const { username, password, subType, properties } = this.state;
    this.setState({ loading: true });
    this.props.add(this.props.domain.ID, {
      username,
      password,
      subType,
      properties: this.toArray({
        ...properties,
        creationtime: moment().format('YYYY-MM-DD HH:mm:ss').toString(),
      }),
    })
      .then(() => {
        this.setState({
          username: '',
          subType: 0,
          properties: [],
          loading: false,
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  handlePropertyChange = field => event => {
    this.setState({
      properties: {
        ...this.state.properties,
        [field]: event.target.value,
      },
    });
  }

  handleIntPropertyChange = field => event => {
    this.setState({
      properties: {
        ...this.state.properties,
        [field]: parseInt(event.target.value) || '',
      },
    });
  }

  toArray(obj) {
    const arr = [];
    Object.entries(obj).forEach(([name, val]) => arr.push({ name, val }));
    return arr;
  }

  render() {
    const { classes, t, domain, open, onSuccess } = this.props;
    const { username, loading, properties, password, repeatPw } = this.state;
    const { storagequotalimit, displayname, displaytypeex } = properties;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('addHeadline', { item: 'User' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("Username")}
              value={username || ''}
              autoFocus
              onChange={this.handleInput('username')}
              style={{ flex: 1, marginRight: 8 }}
              InputProps={{
                endAdornment: <div>@{domain.domainname}</div>,
              }}
              className={classes.input}
              required
            />
            <TextField 
              label={t("Password")}
              value={password || ''}
              onChange={this.handleInput('password')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
              required
            />
            <TextField 
              label={t("Repeat password")}
              value={repeatPw || ''}
              onChange={this.handleInput('repeatPw')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
              required
            />
            <TextField 
              label={t("Real name")}
              value={displayname || ''}
              onChange={this.handlePropertyChange('displayname')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
            />
            <TextField 
              label={t("Storage quota limit")}
              required
              value={storagequotalimit || ''}
              onChange={this.handleIntPropertyChange('storagequotalimit')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="number"
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={displaytypeex || 0}
              onChange={this.handlePropertyChange('displaytypeex')}
            >
              {this.types.map((type, key) => (
                <MenuItem key={key} value={type.ID}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!username || loading || password !== repeatPw || !storagequotalimit}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddUser.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  groups: PropTypes.object.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    groups: state.groups,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, user) => {
      await dispatch(addUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddUser)));