import React, { Component } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { create } from './api-user.jsx';
import { Link } from 'react-router';

const styles = (theme) => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
  },
  error: {
    verticalAlign: 'middle',
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300,
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
  },
});

class Signup extends Component {
  state = {
    name: '',
    password: '',
    email: '',
    open: false,
    error: '',
  };

  handleChange = (name) => (event) => {
    this.setState({ [name]: event.target.value });
  };

  clickSubmit = () => {
    const user = {
      name: this.state.name || undefined,
      email: this.state.email || undefined,
      password: this.state.password || undefined,
    };
    create(user).then((data) => {
      if (data.error) {
        this.setState({ error: data.error });
      } else {
        this.setState({ error: '', open: true });
      }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Card className={classes.card}>
          <CardContent>
            <Typography
              variant='h5'
              component='h2'
              className={classes.title}
            >
              Sign Up
            </Typography>
            <TextField
              id='name'
              label='Name'
              className={classes.textField}
              value={this.state.name}
              onChange={this.handleChange('name')}
              margin='normal'
            />
            <br />
            <TextField
              id='email'
              type='email'
              label='Email'
              className={classes.textField}
              value={this.state.email}
              onChange={this.handleChange('email')}
              margin='normal'
            />
            <br />
            <TextField
              id='password'
              type='password'
              label='Password'
              className={classes.textField}
              value={this.state.password}
              onChange={this.handleChange('password')}
              margin='normal'
            />
            <br />
            {this.state.error && (
              <Typography
                component='p'
                color='error'
              >
                <Icon
                  color='error'
                  className={classes.error}
                >
                  error
                </Icon>
                {this.state.error}
              </Typography>
            )}
          </CardContent>
          <CardActions>
            <Button
              color='primary'
              variant='contained'
              onClick={this.clickSubmit}
              className={classes.submit}
            >
              Submit
            </Button>
          </CardActions>
        </Card>
        <Dialog
          open={this.state.open}
          onClose={(_, reason) => {
            if (reason !== 'backdropClick') this.setState({ open: false });
          }}
        >
          <DialogTitle>New Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              New account successfully created.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Link to='/signin'>
              <Button
                color='primary'
                autoFocus
                variant='contained'
              >
                Sign In
              </Button>
            </Link>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

Signup.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(Signup, styles);
