import React, { PureComponent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField,
  MenuItem, Button, DialogActions, Select, 
} from '@material-ui/core';
import { fetchAreasData } from '../../actions/areas';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import moment from 'moment';
import { addUserData } from '../../actions/users';
import { fetchGroupsData } from '../../actions/groups';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
});

class AddUser extends PureComponent {

  state = {
    username: '',
    areaID: 0,
    groupID: 0,
    maxSize: '',
    sizeUnit: 0,
  }

  componentDidMount() {
    this.props.fetchAreas()
      .catch(msg => this.setState({ snackbar: msg || 'Unknown error' }));
  }

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleCheckbox = field => event => this.setState({
    [field]: event.target.checked,
  });

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      [field]: input,
    });
  }

  handleAdd = () => {
    const { createDay, lang, maxSize } = this.state;
    this.props.add(this.props.domain.ID, {
      ...this.state,
      createDay: moment(createDay).format('YYYY-MM-DD HH:mm').toString(),
      lang: lang || 0,
      sizeUnit: undefined,
      maxFile: 0,
      maxSize: maxSize << (10 * this.state.sizeUnit),
    })
      .then(() => {
        this.setState({
          username: '',
          areaID: 0,
          groupID: 0,
          maxSize: '',
          sizeUnit: 0,
        });
        this.props.onSuccess();
      })
      .catch(error => this.props.onError(error));
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value })

  render() {
    const { classes, t, userAreas, groups, domain, open, onSuccess } = this.props;
    const { username, areaID, groupID, maxSize, sizeUnit } = this.state;

    return (
      <Dialog
        onClose={onSuccess}
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              label={t("username")}
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
              select
              className={classes.input}
              label={t("Data area")}
              fullWidth
              value={areaID || ''}
              onChange={this.handleInput('areaID')}
            >
              {userAreas.map((area, key) => (
                <MenuItem key={key} value={area.ID}>
                  {area.masterPath}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              className={classes.input}
              label={t("Group")}
              fullWidth
              value={groupID || 0}
              onChange={this.handleInput('groupID')}
            >
              <MenuItem value={0}>
                {t('Direct user')}
              </MenuItem>
              {groups.Groups.map((group, key) => (
                <MenuItem key={key} value={group.ID}>
                  {group.groupname}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              className={classes.input} 
              label={t("maximum space")} 
              fullWidth 
              value={maxSize || ''}
              onChange={this.handleNumberInput('maxSize')}
              InputProps={{
                endAdornment:
                  <FormControl>
                    <Select
                      onChange={this.handleUnitChange}
                      value={sizeUnit}
                      className={classes.select}
                    >
                      <MenuItem value={0}>MiB</MenuItem>
                      <MenuItem value={1}>GiB</MenuItem>
                      <MenuItem value={2}>TiB</MenuItem>
                    </Select>
                  </FormControl>,
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
            disabled={!username}
          >
            Add
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
  userAreas: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  onError: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  fetchGroupsData: PropTypes.func.isRequired,
  fetchAreas: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    groups: state.groups,
    userAreas: state.areas.Areas.user || [],
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, user) => {
      await dispatch(addUserData(domainID, user)).catch(msg => Promise.reject(msg));
    },
    fetchAreas: async () => {
      await dispatch(fetchAreasData()).catch(msg => Promise.reject(msg));
    },
    fetchGroupsData: async () => {
      await dispatch(fetchGroupsData());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddUser)));