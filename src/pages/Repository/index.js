import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';

import { Loading, Owner, IssueList, IssueFilter, Pagination } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string
      })
    }).isRequired,
  }

  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      {label: 'Todas', state: 'all', active: true},
      {label: 'Abertas', state: 'open', active: false},
      {label: 'Fechadas', state: 'closed', active: false},
    ],
    filterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 30,
        }
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    })
  }

  handleIssueFilter = async index => {
    await this.setState({
      page: 1,
      filterIndex: index,
      loading: true,
    });

    this.loadIssues();
  }

  loadIssues = async () => {
    const { match } = this.props;
    const { filters, filterIndex, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 30,
        page
      }
    });

    this.setState({
      issues: issues.data,
      loading: false,
    });
  }

  handlePagination = async action => {
    const { page } = this.state;

    this.setState({
      page: action === 'last' ? page -1 : page + 1,
      loading: true,
    });

    this.loadIssues();
  }

  render() {
    const { repository, issues, loading, filters, filterIndex, page } = this.state;

    if(loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt="{repository.owner.login}"/>
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter active={filterIndex}>
            {filters.map((filter, index) => (
              <button type="button" key={filter.state}
                onClick={() => this.handleIssueFilter(index)}>{filter.label}</button>
            ))}
          </IssueFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login}/>
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
           <button type="button" disabled={page < 2} onClick={() => this.handlePagination('last')}>Anterior</button>
           <button type="button" onClick={() => this.handlePagination('next')}>Próximo</button>
        </Pagination>
      </Container>
    );
  }
}
