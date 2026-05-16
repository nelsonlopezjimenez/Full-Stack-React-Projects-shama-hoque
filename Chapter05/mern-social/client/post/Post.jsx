import React, { Component } from 'react';
import auth from './../auth/auth-helper';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import PropTypes from 'prop-types';
import { withStyles } from 'tss-react/mui';
import { Link } from 'react-router';
import { remove, like, unlike } from './api-post.jsx';
import Comments from './Comments';

const styles = (theme) => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    marginBottom: theme.spacing(3),
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  cardContent: {
    backgroundColor: 'white',
    padding: `${theme.spacing(2)} 0px`,
  },
  cardHeader: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  text: {
    margin: theme.spacing(2),
  },
  photo: {
    textAlign: 'center',
    backgroundColor: '#f2f5f4',
    padding: theme.spacing(1),
  },
  media: {
    height: 200,
  },
  button: {
    margin: theme.spacing(1),
  },
});

class Post extends Component {
  state = {
    like: false,
    likes: 0,
    comments: [],
  };

  componentDidMount = () => {
    this.setState({
      like: this.checkLike(this.props.post.likes),
      likes: this.props.post.likes.length,
      comments: this.props.post.comments,
    });
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.post !== this.props.post) {
      this.setState({
        like: this.checkLike(this.props.post.likes),
        likes: this.props.post.likes.length,
        comments: this.props.post.comments,
      });
    }
  };

  checkLike = (likes) => {
    const jwt = auth.isAuthenticated();
    return likes.indexOf(jwt.user._id) !== -1;
  };

  like = () => {
    const callApi = this.state.like ? unlike : like;
    const jwt = auth.isAuthenticated();
    callApi(
      { t: jwt.token },
      this.props.post._id
    ).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ like: !this.state.like, likes: data.likes.length });
      }
    });
  };

  updateComments = (comments) => {
    this.setState({ comments });
  };

  deletePost = () => {
    const jwt = auth.isAuthenticated();
    remove({ postId: this.props.post._id }, { t: jwt.token }).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.props.onRemove(this.props.post);
      }
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar src={`/api/users/${this.props.post.postedBy._id}/photo`} />
          }
          action={
            this.props.post.postedBy._id ===
              auth.isAuthenticated().user._id && (
              <IconButton onClick={this.deletePost}>
                <DeleteIcon />
              </IconButton>
            )
          }
          title={
            <Link to={'/user/' + this.props.post.postedBy._id}>
              {this.props.post.postedBy.name}
            </Link>
          }
          subheader={new Date(this.props.post.created).toDateString()}
          className={classes.cardHeader}
        />
        <CardContent className={classes.cardContent}>
          <Typography
            component='p'
            className={classes.text}
          >
            {this.props.post.text}
          </Typography>
          {this.props.post.photo && (
            <div className={classes.photo}>
              <img
                className={classes.media}
                src={`/api/posts/${this.props.post._id}/photo`}
                alt='post'
              />
            </div>
          )}
        </CardContent>
        <CardActions>
          {this.state.like ? (
            <IconButton
              onClick={this.like}
              className={classes.button}
              aria-label='Like'
              color='secondary'
            >
              <FavoriteIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={this.like}
              className={classes.button}
              aria-label='Unlike'
              color='secondary'
            >
              <FavoriteBorderIcon />
            </IconButton>
          )}
          <span>{this.state.likes}</span>
          <IconButton
            className={classes.button}
            aria-label='Comment'
            color='secondary'
          >
            <CommentIcon />
          </IconButton>
          <span>{this.state.comments.length}</span>
        </CardActions>
        <Divider />
        <Comments
          postId={this.props.post._id}
          comments={this.state.comments}
          updateComments={this.updateComments}
        />
      </Card>
    );
  }
}

Post.propTypes = {
  classes: PropTypes.object.isRequired,
  post: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default withStyles(Post, styles);
