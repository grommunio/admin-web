import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper,
  ListItem,
  ListItemText,
  Collapse,
  List,
  Snackbar,
  Divider,
} from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Delete from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import { connect } from 'react-redux';
import { fetchUserAliasesData, deleteUserAliasData } from '../actions/userAliases';
import TopBar from '../components/TopBar';
import AddUserAlias from '../components/Dialogs/AddUserAlias';
import DomainDataDelete from '../components/Dialogs/DomainDataDelete';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

class UserAliases extends Component {

  state = {
    adding: false,
    deleting: false,
    open: [],
  }

  componentDidMount() {
    const { fetch, domain } = this.props;
    fetch(domain.ID);
  }

  handleAdd = () => this.setState({ adding: true });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDelete = (alias, mainName) => () => this.setState({ deleting: { alias, mainName } });

  handleDeleteClose = () => this.setState({ deleting: false });

  handleEdit = alias => () => {
    const { history } = this.props;
    history.push('/aliases/' + alias.ID, { ...alias });
  }

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
  }

  handleDeleteError = error => this.setState({ snackbar: error });

  handleDomainClicked = domainname => () => {
    const { open } = this.state;
    const idx = open.findIndex(d => d === domainname);
    if(idx === -1) {
      this.setState({ open: [...open, domainname] });
    } else {
      const copy = [...open];
      copy.splice(idx, 1);
      this.setState({ open: copy });
    }
  };

  render() {
    const { classes, aliases, domain, loading } = this.props;
    const { open, adding, snackbar, deleting } = this.state;
  
    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Aliases"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper} elevation={1}>
            <List>
              {!loading && Object.entries(aliases).map(([mainName, aliases]) => <React.Fragment key={mainName}>
                <ListItem button onClick={this.handleDomainClicked(mainName)}>
                  <ListItemText primary={mainName} />
                  {open.includes(mainName) ?
                    <ExpandLess className={classes.expandIcon}/> :
                    <ExpandMore className={classes.expandIcon}/>}
                </ListItem>
                <Divider />
                <Collapse in={open.includes(mainName)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {aliases.map(alias => <React.Fragment key={alias.ID}>
                      <ListItem className={classes.nested}>
                        <ListItemText primary={alias.aliasname} />
                        <IconButton onClick={this.handleDelete(alias, mainName)} >
                          <Delete fontSize="small" color="error" /> 
                        </IconButton>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
              )}
            </List>
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
        <AddUserAlias
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
          domain={this.props.domain}
        />
        <DomainDataDelete
          open={!!deleting}
          delete={() => this.props.delete(domain.ID, deleting.alias.ID, deleting.mainName)}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.alias && deleting.alias.aliasname}
          id={deleting.alias && deleting.alias.ID}
          domainID={domain.ID}
        />
      </div>
    );
  }
}

UserAliases.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  aliases: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    aliases: state.userAliases.Aliases,
    loading: state.userAliases.loading,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async domainID => {
      await dispatch(fetchUserAliasesData(domainID)).catch(error => Promise.reject(error));
    },
    delete: async (domainID, aliasID, mainName) => {
      await dispatch(deleteUserAliasData(domainID, aliasID, mainName)).catch(error => Promise.reject(error));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(UserAliases)));