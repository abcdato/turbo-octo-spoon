/* eslint-disable no-console */
import React, { Component } from 'react';
import { Alert, Spin, Input, Pagination } from 'antd';
import debounce from 'lodash.debounce';
import MovieCard from '../MovieCard/MovieCard';

import MovieService from '../../api/MovieService';

import './MovieList.scss';

class MovieList extends Component {
  movieService = new MovieService();

  state = {
    movies: [],
    totalPages: 0,
    query: 'return',
    currentPage: 1,
    loading: true,
    error: false,
    errorMessage: '',
  };

  debouncedLoadData = debounce(this.loadData, 750);

  componentDidMount() {
    const { query, currentPage } = this.state;

    console.log('componentDidMount >>>', 'query:', query, 'currentPage:', currentPage);

    this.loadData(query, currentPage);
  }

  componentDidUpdate(prevProps, prevState) {
    const { query, currentPage } = this.state;

    if (currentPage !== prevState.currentPage) {
      console.log(
        'componentDidUpdate >>>',
        'currentPage:',
        currentPage,
        'prevState.currentPage:',
        prevState.currentPage
      );

      this.loadData(query, currentPage);
    }
  }

  onError = (message) => {
    this.setState({
      loading: false,
      error: true,
      errorMessage: message,
    });
  };

  onPageChange = (page) => {
    this.setState({ currentPage: page, loading: true });
  };

  searchMovie = (event) => {
    console.log('event.target.value >>>', event.target.value);

    if (event.target.value === '') {
      this.setState({
        query: '',
        loading: false,
      });
      return;
    }

    this.setState({
      query: event.target.value,
      currentPage: 1,
      loading: true,
    });

    this.debouncedLoadData(event.target.value);
  };

  async loadData(movie, page) {
    try {
      const data = await this.movieService.getMovies(movie, page);

      if (data.movies.length === 0) {
        this.setState({
          loading: false,
          error: true,
          errorMessage: "Unfortunately we couldn't find any movies",
        });
        return;
      }

      this.setState({
        movies: data.movies,
        totalPages: data.totalPages,
        loading: false,
        error: false,
      });
    } catch {
      this.onError("Couldn't load the data.");
    }
  }

  showMovies(data) {
    return data.map((movie) => {
      const { id, title, releaseDate, overview, posterPath } = movie;

      return <MovieCard key={id} title={title} releaseDate={releaseDate} overview={overview} posterPath={posterPath} />;
    });
  }

  render() {
    console.log('<<< render >>> ');
    const { movies, totalPages, currentPage, loading, query, error, errorMessage } = this.state;

    const hasData = !(loading || error);
    const spinner = loading ? <Spin size="large" /> : null;
    const content = hasData ? this.showMovies(movies) : null;

    const errorMsg = error ? <Alert message="Error" description={errorMessage} type="warning" showIcon /> : null;

    const pagination = hasData ? (
      <Pagination
        current={currentPage}
        pageSize={1}
        showSizeChanger={false}
        onChange={this.onPageChange}
        total={totalPages}
      />
    ) : null;

    return (
      <>
        <header className="header">
          <Input placeholder="Type to search..." value={query} onChange={this.searchMovie} />
        </header>
        <main className="main">
          <ul className="movie-list list">
            {spinner}
            {errorMsg}
            {content}
          </ul>
        </main>
        <footer className="footer">{pagination}</footer>
      </>
    );
  }
}

export default MovieList;
