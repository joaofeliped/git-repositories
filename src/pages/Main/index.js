import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';
import { Form, SubmitButton, List } from './styles';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if(repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if(prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  }

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({
      loading: true,
      error: false,
    });

    const { newRepo, repositories } = this.state;

    try {
      const duplicateRepo = repositories.find(repo => repo.name === newRepo);

      if(duplicateRepo) {
        throw 'Repositório Duplicado';
      }

      const response = await api.get(`/repos/${newRepo}`);

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [... repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch(error) {
      this.setState({
        error: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  handleDelete = repository => {
    const { repositories } = this.state;

    const newRepos = repositories.filter(repo => repo.name !== repository.name);

    this.setState({
      repositories: newRepos
    })
  }

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input value={newRepo}
            onChange={this.handleInputChange}
            type="text" placeholder="Adicionar repositório"/>

          <SubmitButton loading={loading}>
            { loading ? <FaSpinner color="#FFF" size={14}/> : <FaPlus color="#FFF" size={14} /> }
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
               <span>{repository.name}</span>
               <Link to={`/repository/${encodeURIComponent(repository.name)}`}>Detalhes</Link>
               <button type="button" onClick={() => this.handleDelete(repository)}>Remover</button>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
