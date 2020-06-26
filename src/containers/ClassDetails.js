import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  MenuItem,
} from '@material-ui/core';
import { connect } from 'react-redux';
import { editClassData, addClassData } from '../actions/classes';
import TopBar from '../components/TopBar';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    padding: theme.spacing(2, 2),
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'scroll',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
});

class ClassDetails extends PureComponent {

  constructor(props) {
    super(props);
    const domain = this.props.location.state;
    if(!domain) {
      this.props.history.push('/classes');
      this.state = {
        changes: {},
      };
    }
    else this.state = {
      changes: domain,
      editing: !!domain.ID,
    };
  }

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleCheckbox = field => event => this.setState({
    changes: {
      ...this.state.changes,
      [field]: event.target.checked,
    },
    unsaved: true,
  });

  handleDateChange = field => date => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: date,
      },
    });
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input && input.match("^\\d*?$")) input = parseInt(input);
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: input,
      },
    });
  }

  handleAdd = () => {
    this.props.add(this.state.changes);
  }

  handleEdit = () => {
    this.props.edit(this.state.changes);
  }

  render() {
    const { classes, t, domains, groups } = this.props;
    const changes = this.state.changes;

    return (
      <div className={classes.root}>
        <TopBar title="Classes"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {this.state.editing ? t('Edit class') : t('Add class')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("classname")} 
                fullWidth 
                value={changes.classname || ''}
                onChange={this.handleInput('classname')}
              />
              <TextField 
                className={classes.input} 
                label={t("listname")} 
                fullWidth 
                value={changes.listname || ''}
                onChange={this.handleInput('listname')}
              />
              <TextField
                select
                className={classes.input}
                label={t("domain")}
                fullWidth
                value={changes.domainID || 0}
                onChange={this.handleInput('domainID')}
              >
                {domains.Domains.map((domain, key) => (
                  <MenuItem key={key} value={domain.ID}>
                    {domain.domainname}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                className={classes.input}
                label={t("group")}
                fullWidth
                value={changes.groupID || 0}
                onChange={this.handleInput('groupID')}
              >
                {groups.Groups.map((group, key) => (
                  <MenuItem key={key} value={group.ID}>
                    {group.groupname}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/classes')}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.state.editing ? this.handleEdit: this.handleAdd}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

ClassDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    domains: state.domains,
    groups: state.groups,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async Class => {
      await dispatch(addClassData(Class));
    },
    edit: async Class => {
      await dispatch(editClassData(Class));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ClassDetails)));