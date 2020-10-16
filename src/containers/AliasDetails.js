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
import { editAliasData } from '../actions/aliases';
import TopBar from '../components/TopBar';
import { fetchDomainData } from '../actions/domains';

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

class AliasDetails extends PureComponent {

  constructor(props) {
    super(props);
    const domain = this.props.location.state;
    if(!domain) {
      this.props.history.push('/aliases');
      this.state = {
        changes: {},
      };
    }
    else this.state = {
      changes: domain,
      editing: !!domain.ID,
    };
  }

  componentDidMount() {
    this.props.fetchDomains()
      .catch(error => this.setState({ snackbar: error }));
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

  handleEdit = () => {
    this.props.edit(this.state.changes)
      .catch(error => this.setState({ snackbar: error }));
  }

  render() {
    const { classes, t, domains } = this.props;
    const { alias, domainID } = this.state.changes;

    return (
      <div className={classes.root}>
        <TopBar title="Aliases"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {this.state.editing ? t('Edit alias') : t('Add alias')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField
                select
                className={classes.input}
                label={t("Domain")}
                fullWidth
                value={domainID || ''}
                onChange={this.handleInput('domainID')}
              >
                {domains.map((domain, key) => (
                  <MenuItem key={key} value={domain.ID}>
                    {domain.domainname}
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                className={classes.input} 
                label={t("Alias name")} 
                fullWidth 
                value={alias || ''}
                onChange={this.handleInput('alias')}
                autoFocus
              />
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={() => this.props.history.push('/aliases')}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleEdit}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

AliasDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  edit: PropTypes.func.isRequired,
  fetchDomains: PropTypes.func.isRequired,
  domains: PropTypes.array.isRequired,
};

const mapStateToProps = state => {
  return {
    domains: state.domains.Domains,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async org => {
      await dispatch(editAliasData(org)).catch(msg => Promise.reject(msg));
    },
    fetchDomains: async () => {
      await dispatch(fetchDomainData()).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AliasDetails)));