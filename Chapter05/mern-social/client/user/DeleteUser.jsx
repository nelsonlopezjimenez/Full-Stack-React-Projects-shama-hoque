import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Navigate } from 'react-router';
import auth from './../auth/auth-helper';
import { remove } from './api-user.jsx';

class DeleteUser extends Component {
  state = {
    redirect: false,
    open: false,
  };

  clickButton = () => {
    this.setState({ open: true });
  };

  deleteAccount = () => {
    const jwt = auth.isAuthenticated();
    remove({ userId: this.props.userId }, { t: jwt.token }).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        auth.signout(() => console.log('deleted'));
        this.setState({ redirect: true });
      }
    });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    if (this.state.redirect) {
      return <Navigate to='/' />;
    }
    return (
      <span>
        <IconButton
          aria-label='Delete'
          onClick={this.clickButton}
          color='secondary'
        >
          <DeleteIcon />
        </IconButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleRequestClose}
        >
          <DialogTitle>{'Delete Account'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Confirm to delete your account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleRequestClose}
              color='primary'
            >
              Cancel
            </Button>
            <Button
              onClick={this.deleteAccount}
              color='secondary'
              autoFocus
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    );
  }
}

DeleteUser.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default DeleteUser;
