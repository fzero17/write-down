import React, { Component } from "react";
import { Col, Row, Tag, Icon, Input, Tooltip } from "antd";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'

import { GeneralHeader as Header } from './Header';
import mockData from './data';
import { checkImageUrlIsValid } from "../utils";

import styles from "./ArticleList.module.css";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

class ArticlesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      src: [],
      isLoggedIn: true
    };
  }

  componentDidMount() {
    this.setState({
      src: mockData
    });
  }


  render() {
    const ArticleList = this.state.src.map(data => (
      <ArticleItem metaData={data} key={data._id} isLoggedIn={this.state.isLoggedIn}/>
    ));


    return (
      <>
        <Header/>
        <Row>
          <Col md={4} sm={2} xs={0}>

          </Col>
          <Col className={styles.list} md={16} sm={20} xs={24}>
            {ArticleList}
          </Col>
          <Col md={4} sm={2} xs={0}>

          </Col>

        </Row>
      </>
    );
  }
}

class ArticleItem extends Component{
  constructor(props) {
    super(props);
    this.state = {
      coverUrl: '',
      tags: this.props.metaData.tags,
      isCoverUrlValid: false,
      isTagsEditable: false
    };
  }

  async componentDidMount() {
    try {
      const coverUrl = await checkImageUrlIsValid(this.props.metaData.coverUrl);

      this.setState({
        coverUrl: coverUrl,
        isCoverUrlValid: true
      });
    } catch (error) {

    }
  }

  handleTagsEditableToggle = () => {
    this.setState((prevState) => ({
      isTagsEditable: !prevState.isTagsEditable
    }));
  };

  handleTagsUpdate = (newTagsArray) => {
    this.setState({
      tags: newTagsArray
    });

    // todo: update the database
  };

  render() {
    const { _id, title, author, excerpt, updatedAt } = this.props.metaData;

    const { tags } = this.state;

    return (
      <div className={styles.itemWrapper}>
        {
          this.state.isCoverUrlValid
            ?
            <div className={styles.imageWrapper}>
              <div
                className={styles.image}
                style={{backgroundImage: `url(${this.state.coverUrl})`}}
              />
            </div>
            : null
        }
        <div className={styles.contentWrapper}>
          <h2 className={styles.title}>{title}</h2>
          <Row className={styles.infoWrapper} type='flex' justify='space-between'>
            <Col>
              Posted by <span className={styles.author}>{author}</span>
            </Col>
            <Col>
              <span className={styles.postedTime}>{dayjs(updatedAt).fromNow()}</span>
            </Col>
          </Row>
          <p className={styles.excerpt}>
            {
              excerpt.length > 300
              ? <span>
                  {excerpt.slice(0, 300) + ' ... '}<a href = "#" >Read More</a>
                </span>
              : <span>
                  {excerpt + ' '} <a href="#">Read More</a>
                </span>
            }
          </p>
          <div>
            {
              this.props.isLoggedIn
                ?
                <div className={styles.editOptionsBar}>
                  <Link to={`/article/${_id}/edit`}>
                    <button className={styles.editOption} title='Jump to the edit page.'>
                      <Icon type="edit" />
                    </button>
                  </Link>
                  <button
                    className={styles.editOption}
                    onClick={this.handleTagsEditableToggle}
                    title='Toggle the tags edit option to modify the tags on the right side.'>
                    <Icon type="tags" />
                  </button>
                  <button className={styles.editOption} title='Notice! It will delete the article from Database.'>
                    <Icon type="delete" />
                  </button>
                </div>
                : null
            }
          </div>
          <div className={styles.tagListWrapper}>
            <div className={styles.tagList}>
              <EditableTagGroup tags={tags} isEditable={this.state.isTagsEditable} handleTagsUpdate={this.handleTagsUpdate}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class EditableTagGroup extends React.Component {
  state = {
    inputVisible: false,
    inputValue: '',
  };

  saveInputRef = input => this.input = input;

  handleClose = (removedTag) => {
    const tags = this.props.tags.filter(tag => tag !== removedTag);

    this.props.handleTagsUpdate(tags);
  };

  showInput = () => {
    this.setState(
      { inputVisible: true },
      () => this.input.focus()
    );
  };

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    let tags = this.props.tags.slice();
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      inputVisible: false,
      inputValue: '',
    });

    this.props.handleTagsUpdate(tags);
  };

  render() {
    const { inputVisible, inputValue } = this.state;
    const { tags, isEditable } = this.props;
    return (
      <div>
        {
          tags.map((tag) => {
            const isLongTag = tag.length > 12;
            const tagElem = (
              <Tag key={tag} closable={isEditable} afterClose={() => this.handleClose(tag)}>
                {isLongTag ? `${tag.slice(0, 12)}...` : tag}
              </Tag>
            );
            return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
          })
        }
        {
          inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              className={styles.tagInput}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )
        }
        {
          isEditable && !inputVisible && (
            <Tag
              onClick={this.showInput}
              style={{ borderStyle: 'dashed' }}
            >
              <Icon type="plus" /> New Tag
            </Tag>
          )
        }
      </div>
    );
  }
}

export default ArticlesPage;