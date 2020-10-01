import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, CircularProgress, 
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addUserAliasData } from '../../actions/userAliases';
import { fetchUsersData } from '../../actions/users';

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

class AddUserAlias extends PureComponent {

  state = {
    userID: '',
    aliasname: '',
    loading: false,
  }

  componentDidMount() {
    this.props.fetchUsers(this.props.domain.ID);
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleAdd = () => {
    const { add, onSuccess, onError, domain } = this.props;
    const { userID, aliasname } = this.state;
    this.setState({ loading: true });
    add(domain.ID, userID, aliasname)
      .then(() => {
        this.setState({
          userID: '',
          aliasname: '',
          loading: false,
        });
        onSuccess();
      })
      .catch(error => {
        onError(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { classes, t, open, onSuccess, users, domain } = this.props;
    const { userID, aliasname, loading } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('Add')}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField
              select
              className={classes.input}
              label={t("Username")}
              fullWidth
              value={userID || ''}
              onChange={this.handleInput('userID')}
            >
              {users.map((user, key) => (
                <MenuItem key={key} value={user.ID}>
                  {user.username}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              className={classes.input}
              label={t("Alias name")} 
              fullWidth 
              value={aliasname || ''}
              onChange={this.handleInput('aliasname')}
              InputProps={{
                endAdornment: <div>@{domain.domainname}</div>,
              }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onSuccess}
            variant="contained"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={!userID || !aliasname || loading}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddUserAlias.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
  return {
    users: state.users.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, userID, aliasname) => {
      await dispatch(addUserAliasData(domainID, userID, aliasname)).catch(error => Promise.reject(error));
    },
    fetchUsers: async domainID => {
      await dispatch(fetchUsersData(domainID)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddUserAlias)));