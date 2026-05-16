import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Edit from '@mui/icons-material/Edit';
import { Navigate, Link } from 'react-router';
import auth from './../auth/auth-helper';
import { read } from './api-user.jsx';
import DeleteUser from './DeleteUser';
import FollowProfileButton from './../user/FollowProfileButton';
import ProfileTabs from './../user/ProfileTabs';
import { listByUser } from './../post/api-post.jsx';
import { withRouter } from './../withRouter';

const styles = (theme) => ({
  root: {
    maxWidth: 600,
    margin: 'auto',
    padding: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginTop: theme.spacing(5),
  },
  title: {
    margin: `${theme.spacing(2)} ${theme.spacing(1)} 0`,
    color: theme.palette.protectedTitle,
    fontSize: '1em',
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 10,
  },
});

class Profile extends Component {
  constructor({ match }) {
    super();
    this.state = {
      user: { following: [], followers: [] },
      redirectToSignin: false,
      following: false,
      posts: [],
    };
    this.match = match;
  }

  init = (userId) => {
    const jwt = auth.isAuthenticated();
    read({ userId }, { t: jwt.token }).then((data) => {
      if (data.error) {
        this.setState({ redirectToSignin: true });
      } else {
        const following = this.checkFollow(data);
        this.setState({ user: data, following });
        this.loadPosts(data._id);
      }
    });
  };

  componentDidMount = () => {
    this.init(this.match.params.userId);
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.init(this.props.match.params.userId);
    }
  };

  checkFollow = (user) => {
    const jwt = auth.isAuthenticated();
    return user.followers.find((follower) => follower._id == jwt.user._id);
  };

  clickFollowButton = (callApi) => {
    const jwt = auth.isAuthenticated();
    callApi(
      { userId: jwt.user._id },
      { t: jwt.token },
      this.state.user._id
    ).then((data) => {
      if (data.error) {
        this.setState({ error: data.error });
      } else {
        this.setState({ user: data, following: !this.state.following });
      }
    });
  };

  loadPosts = (user) => {
    const jwt = auth.isAuthenticated();
    listByUser({ userId: user }, { t: jwt.token }).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ posts: data });
      }
    });
  };

  removePost = (post) => {
    const updatedPosts = this.state.posts;
    const index = updatedPosts.indexOf(post);
    updatedPosts.splice(index, 1);
    this.setState({ posts: updatedPosts });
  };

  render() {
    const { classes } = this.props;
    const photoUrl = this.state.user._id
      ? `/api/users/${this.state.user._id}/photo?${new Date().getTime()}`
      : '/api/users/defaultphoto';
    if (this.state.redirectToSignin) {
      return <Navigate to='/signin' />;
    }
    return (
      <Paper
        className={classes.root}
        elevation={4}
      >
        <Typography
          variant='h6'
          className={classes.title}
        >
          Profile
        </Typography>
        <List dense>
          <ListItem
            secondaryAction={
              auth.isAuthenticated().user &&
              auth.isAuthenticated().user._id == this.state.user._id ? (
                <span>
                  <Link to={'/user/edit/' + this.state.user._id}>
                    <IconButton
                      aria-label='Edit'
                      color='primary'
                    >
                      <Edit />
                    </IconButton>
                  </Link>
                  <DeleteUser userId={this.state.user._id} />
                </span>
              ) : (
                <FollowProfileButton
                  following={this.state.following}
                  onButtonClick={this.clickFollowButton}
                />
              )
            }
          >
            <ListItemAvatar>
              <Avatar
                src={photoUrl}
                className={classes.bigAvatar}
              />
            </ListItemAvatar>
            <ListItemText
              primary={this.state.user.name}
              secondary={this.state.user.email}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={this.state.user.about}
              secondary={
                'Joined: ' + new Date(this.state.user.created).toDateString()
              }
            />
          </ListItem>
        </List>
        <ProfileTabs
          user={this.state.user}
          posts={this.state.posts}
          removePostUpdate={this.removePost}
        />
      </Paper>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(Profile, styles));
