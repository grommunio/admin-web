import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, Grid, FormControlLabel, Checkbox, 
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
    realName: '',
    subType: 0,
    // eslint-disable-next-line camelcase
    pop3_imap: true,
    smtp: true,
    changePassword: true,
    publicAddress: true,
    loading: false,
  }

  types = [
    { name: 'Normal', ID: 0 },
    { name: 'Room', ID: 1 },
    { name: 'Equipment', ID: 2 },
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
    const { username, createDay, lang, realName,
      // eslint-disable-next-line camelcase
      pop3_imap, smtp, changePassword, publicAddress, password, subType } = this.state;
    this.setState({ loading: true });
    this.props.add(this.props.domain.ID, {
      username,
      realName,
      // eslint-disable-next-line camelcase
      pop3_imap,
      smtp,
      changePassword,
      publicAddress,
      password,
      subType,
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      lang: lang || 0,
    })
      .then(() => {
        this.setState({
          username: '',
          realName: '',
          // eslint-disable-next-line camelcase
          pop3_imap: true,
          smtp: true,
          changePassword: true,
          publicAddress: true,
          subType: 0,
          loading: false,
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, domain, open, onSuccess } = this.props;
    const { username, loading, realName, subType,
      // eslint-disable-next-line camelcase
      pop3_imap, smtp, changePassword, publicAddress, password, repeatPw } = this.state;

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
            />
            <TextField 
              label={t("Password")}
              value={password || ''}
              onChange={this.handleInput('password')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
            />
            <TextField 
              label={t("Repeat password")}
              value={repeatPw || ''}
              onChange={this.handleInput('repeatPw')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
              type="password"
            />
            <TextField 
              label={t("Display name")}
              value={realName || ''}
              onChange={this.handleInput('realName')}
              style={{ flex: 1, marginRight: 8 }}
              className={classes.input}
            />
            <TextField
              select
              className={classes.input}
              label={t("Type")}
              fullWidth
              value={subType || 0}
              onChange={this.handleInput('subType')}
            >
              {this.types.map((type, key) => (
                <MenuItem key={key} value={type.ID}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
            <Grid container className={classes.input}>
              <FormControlLabel
                label={t('Allow pop3 or imap downloading')}
                control={
                  <Checkbox
                    // eslint-disable-next-line camelcase
                    checked={pop3_imap || false}
                    onChange={this.handleCheckbox('pop3_imap')}
                  />
                }
              />
              <FormControlLabel
                label={t('Allow smtp sending')}
                control={
                  <Checkbox
                    checked={smtp || false}
                    onChange={this.handleCheckbox('smtp')}
                  />
                }
              />
              <FormControlLabel
                label={t('Allow change password')}
                control={
                  <Checkbox
                    checked={changePassword || false}
                    onChange={this.handleCheckbox('changePassword')}
                  />
                }
              />
              <FormControlLabel
                label={t('Public user information')}
                control={
                  <Checkbox
                    checked={publicAddress || false}
                    onChange={this.handleCheckbox('publicAddress')}
                  />
                }
              />
            </Grid>
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
            disabled={!username || loading || password !== repeatPw}
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