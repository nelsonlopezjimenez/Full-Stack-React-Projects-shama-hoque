import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import seashellImg from './../assets/images/seashell.jpg';
import { Link } from 'react-router';
import auth from './../auth/auth-helper';
import FindPeople from './../user/FindPeople';
import Newsfeed from './../post/Newsfeed';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  card: {
    maxWidth: 600,
    margin: 'auto',
    marginTop: theme.spacing(5),
  },
  title: {
    padding: `${theme.spacing(3)} ${theme.spacing(2.5)} ${theme.spacing(2)}`,
    color: theme.palette.text.secondary,
  },
  media: {
    minHeight: 330,
  },
});

class Home extends Component {
  state = {
    defaultPage: true,
  };

  init = () => {
    if (auth.isAuthenticated()) {
      this.setState({ defaultPage: false });
    } else {
      this.setState({ defaultPage: true });
    }
  };

  componentDidMount = () => {
    this.init();
  };

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {this.state.defaultPage && (
          <Grid
            container
            spacing={3}
          >
            <Grid xs={12}>
              <Card className={classes.card}>
                <Typography
                  variant='h5'
                  component='h2'
                  className={classes.title}
                >
                  Home Page
                </Typography>
                <CardMedia
                  className={classes.media}
                  image={seashellImg}
                  title='Unicorn Shells'
                />
                <CardContent>
                  <Typography
                    variant='body1'
                    component='p'
                  >
                    Welcome to the MERN Social home page.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        {!this.state.defaultPage && (
          <Grid
            container
            spacing={3}
          >
            <Grid
              xs={8}
              sm={7}
            >
              <Newsfeed />
            </Grid>
            <Grid
              xs={6}
              sm={5}
            >
              <FindPeople />
            </Grid>
          </Grid>
        )}
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(Home, styles);
