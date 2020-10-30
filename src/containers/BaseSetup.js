import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import {
  Paper,
  TextField,
  FormControl,
  MenuItem,
  Button,
  Typography,
  InputAdornment,
  Select,
  Collapse,
  IconButton,
  Grid,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import TopBar from '../components/TopBar';
import { editBaseSetup, baseSetup } from '../api';
import HomeIcon from '@material-ui/icons/Home';
import blue from '../colors/blue';

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
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  toolbar: theme.mixins.toolbar,
  gird: {
    display: 'flex',
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
  paper: {
    padding: theme.spacing(1.5, 3),
  },
});

class BaseSetup extends Component {

  state = {
    help: false,
    changes: {},
  }

  componentDidMount() {
    baseSetup();
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

  handleSave = () => editBaseSetup(this.state.changes);

  toggleHelp = () => this.setState({ help: !this.state.help });

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  render() {
    const { classes, t } = this.props;
    const { changes, help } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}/>
        <div className={classes.base}>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Base setup")}
            <span className={classes.pageTitleSecondary}> |</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Paper className={classes.paper} elevation={1}>
            <Grid container justify="flex-end">
              <IconButton onClick={this.toggleHelp}>
                <InfoIcon />
              </IconButton>
            </Grid>
            <Collapse timeout={100} in={help}>
              <Typography>default domain, referenced by bounce mail, statistics mail ...</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("default domain")} 
                fullWidth 
                value={changes.defaultDomain || ''}
                onChange={this.handleInput('defaultDomain')}
                autoFocus
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>administrator&quot;s mailbox, destination for alram mail, complaining mail ...</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField 
                className={classes.input} 
                label={t("administrator's mailbox")} 
                fullWidth 
                value={changes.adminMail || ''}
                onChange={this.handleInput('adminMail')}
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>maximum allowed mail numbers on one SMTP session</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField
                className={classes.input}
                label={t("maximum session mail numbers")}
                fullWidth
                value={changes.maxSession || ''}
                onChange={this.handleNumberInput('maxSession')}
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>rcpt limitation</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField
                className={classes.input}
                label={t("maximum rcpt number")}
                fullWidth
                value={changes.rcpt || ''}
                onChange={this.handleInput('rcpt')}
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>maximum mail length by SMTP transferring</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField
                className={classes.input}
                label={t("maximum mail length")}
                fullWidth
                value={changes.maxLength || ''}
                onChange={this.handleInput('maxLength')}
                InputProps={{
                  endAdornment: <InputAdornment position="start">
                    <Select
                      value={changes.lengthUnit || 0}
                      onChange={this.handleInput('lengthUnit')}
                    >
                      <MenuItem value={0}>
                          K
                      </MenuItem>
                      <MenuItem value={1}>
                          M
                      </MenuItem>
                    </Select>
                  </InputAdornment>,
                }}
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>maximum time-out value for SMTP connection</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField
                className={classes.input}
                label={t("SMTP time-out")}
                fullWidth
                value={changes.timeout || ''}
                onChange={this.handleInput('timeout')}
                InputProps={{
                  endAdornment: <InputAdornment position="start">
                    <Select
                      value={changes.timoutUnit || 0}
                      onChange={this.handleInput('timoutUnit')}
                    >
                      <MenuItem value={0}>
                          minutes
                      </MenuItem>
                      <MenuItem value={1}>
                          seconds
                      </MenuItem>
                    </Select>
                  </InputAdornment>,
                }}
              />
            </FormControl>
            <Collapse timeout={100} in={help}>
              <Typography>anti-virus scanning size, over this size, anti-virus will not scan the mail</Typography>
            </Collapse>
            <FormControl className={classes.form}>
              <TextField
                className={classes.input}
                label={t("anti-virus maximum scanning size")}
                fullWidth
                value={changes.maxScanningSize || ''}
                onChange={this.handleInput('maxScanningSize')}
                InputProps={{
                  endAdornment: <InputAdornment position="start">
                    <Select
                      value={changes.scanningSizeUnit || 1}
                      onChange={this.handleInput('scanningSizeUnit')}
                    >
                      <MenuItem value={0}>
                          B
                      </MenuItem>
                      <MenuItem value={1}>
                          K
                      </MenuItem>
                      <MenuItem value={2}>
                          M
                      </MenuItem>
                    </Select>
                  </InputAdornment>,
                }}
              />
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleSave}
            >
              Save
            </Button>
          </Paper>
        </div>
      </div>
    );
  }
}

BaseSetup.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTranslation()(withStyles(styles)(BaseSetup));