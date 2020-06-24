import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Grid, Typography, Button, List, ListItem, ListItemText,
  ListItemSecondaryAction } from '@material-ui/core';
import { connect } from 'react-redux';
import { fetchAliasesData, deleteAliasData } from '../actions/aliases';

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
});

class Aliases extends Component {

  state = {
    changes: {},
  }

  componentDidMount() {
    this.props.fetch();
  }

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
    });
  }

  handleAdd = () => {
    const { history } = this.props;
    history.push('/aliases/add', {});
  }

  handleEdit = alias => () => {
    const { history } = this.props;
    history.push('/aliases/' + alias.ID, { ...alias });
  }

  handleDelete = id => () => {
    this.props.delete(id).then(this.props.fetch);
  }

  render() {
    const { classes, aliases } = this.props;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Grid className={classes.grid} container>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <Typography align="center" variant="h4" color="primary">Aliases</Typography>
            </Grid>
            <Grid item xs={3} className={classes.flexRowEnd}>
              <Button variant="contained" color="primary" onClick={this.handleAdd}>Add</Button>
            </Grid>
          </Grid>
          <Paper className={classes.tablePaper}>
            <List>
              {aliases.Aliases.map((obj, idx) =>
                <ListItem key={idx}>
                  <ListItemText
                    primary={obj.aliasname}
                    secondary={obj.mainname}
                  >
                  </ListItemText>
                  <ListItemSecondaryAction className={classes.flexRowEnd}>
                    <Button onClick={this.handleEdit(obj)}>Edit</Button>
                    <Button onClick={this.handleDelete(obj.ID)}>Delete</Button>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
          </Paper>
        </div>
      </div>
    );
  }
}

Aliases.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  aliases: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { aliases: state.aliases };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchAliasesData());
    },
    delete: async id => {
      await dispatch(deleteAliasData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Aliases)));