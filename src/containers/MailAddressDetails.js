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
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import TopBar from '../components/TopBar';
import { editMailAddress, addMailAddress } from '../api';

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
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
});

class MailAddressDetails extends PureComponent {

  constructor(props) {
    super(props);
    const folder = props.location.state;
    if(!folder) {
      this.state = {
        changes: {},
      };
      props.history.push('/' + props.domain.domainname + '/mailAddresses');
    }
    else this.state = {
      changes: folder,
      editing: !!folder.ID,
    };
  }

  types = [
    { name: 'mail and post items', ID: 0 },
    { name: 'contact', ID: 1 },
    { name: 'journal', ID: 2 },
    { name: 'calendar', ID: 3 },
    { name: 'note', ID: 4 },
    { name: 'task', ID: 5 },
    { name: 'infopath items', ID: 6 },
  ]

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

  handleAdd = () => {
    addMailAddress({
      ...this.state.changes,
    }, this.props.domain.ID);
    this.props.history.push('/' + this.props.domain.domainname + '/mailAddresses');
  }

  handleEdit = () => {
    editMailAddress({
      ...this.state.changes,
    }, this.props.domain.ID);
  }

  render() {
    const { classes, t } = this.props;
    const { editing, changes } = this.state;

    return (
      <div className={classes.root}>
        <TopBar title="Mail addresses"/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Paper className={classes.paper} elevation={2}>
            <Grid container>
              <Typography
                color="primary"
                variant="h5"
              >
                {editing ? t('Edit mail address') : t('Add mail address')}
              </Typography>
            </Grid>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("list name")} 
                fullWidth 
                value={changes.listName || ''}
                onChange={this.handleInput('listName')}
                autoFocus
              />
              <TextField
                select
                className={classes.input}
                label={t("list type")}
                fullWidth
                value={changes.listType || 0}
                onChange={this.handleInput('listType')}
              >
                {this.types.map((type, key) => (
                  <MenuItem key={key} value={type.ID}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              <Grid container className={classes.input}>
                <FormControlLabel
                  label={t('free to expand')}
                  control={
                    <Checkbox
                      checked={changes.free || false}
                      onChange={this.handleCheckbox('free')}
                    />
                  }
                />
                <FormControlLabel
                  label={t('internal members')}
                  control={
                    <Checkbox
                      checked={changes.internal || false}
                      onChange={this.handleCheckbox('internal')}
                    />
                  }
                />
                <FormControlLabel
                  label={t('inter-domain')}
                  control={
                    <Checkbox
                      checked={changes.interDomain || false}
                      onChange={this.handleCheckbox('interDomain')}
                    />
                  }
                />
                <FormControlLabel
                  label={t('specified senders')}
                  control={
                    <Checkbox
                      checked={changes.specifiedSenders || false}
                      onChange={this.handleCheckbox('specifiedSenders')}
                    />
                  }
                />
                <FormControlLabel
                  label={t('virtual')}
                  control={
                    <Checkbox
                      checked={changes.virtual || false}
                      onChange={this.handleCheckbox('virtual')}
                    />
                  }
                />
                <FormControlLabel
                  label={t('extended cryptosecurity')}
                  control={
                    <Checkbox
                      checked={changes.extendedCryptosecurity || false}
                      onChange={this.handleCheckbox('extendedCryptosecurity')}
                    />
                  }
                />
              </Grid>
            </FormControl>
            <Button
              variant="text"
              color="secondary"
              onClick={this.props.history.goBack}
              style={{ marginRight: 8 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={editing ? this.handleEdit: this.handleAdd}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

MailAddressDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};


export default withTranslation()(withStyles(styles)(MailAddressDetails));