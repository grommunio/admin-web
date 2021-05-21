import React, { PureComponent } from 'react';
import { Button, FormControl, Grid, IconButton, List, ListItem,
  TextField, Typography, withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Delete } from '@material-ui/icons';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  listTextfield: {
    flex: 1,
  },
});

class Smtp extends PureComponent {

  render() {
    const { classes, t, aliases, handleAliasEdit, handleRemoveAlias, handleAddAlias } = this.props;
    return (
      <FormControl className={classes.form}>
        <Typography variant="h6" className={classes.headline}>{t('E-Mail Addresses')}</Typography>
        <List className={classes.list}>
          {(aliases || []).map((alias, idx) => <ListItem key={idx} className={classes.listItem}>
            <TextField
              className={classes.listTextfield}
              value={alias}
              label={'Alias ' + (idx + 1)}
              onChange={handleAliasEdit(idx)}
            />
            <IconButton onClick={handleRemoveAlias(idx)}>
              <Delete color="error" />
            </IconButton>
          </ListItem>
          )}
        </List>
        <Grid container justify="center">
          <Button variant="contained" onClick={handleAddAlias}>{t('addHeadline', { item: 'E-Mail' })}</Button>
        </Grid>
      </FormControl>
    );
  }
}

Smtp.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  aliases: PropTypes.array.isRequired,
  handleAliasEdit: PropTypes.func.isRequired,
  handleAddAlias: PropTypes.func.isRequired,
  handleRemoveAlias: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(Smtp));
