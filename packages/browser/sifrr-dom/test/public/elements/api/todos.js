const { html, memo } = Sifrr.Template;

const ApiTodo = html`
  <api-todo
    :completed=${({ completed }) => completed}
    :data-id=${({ id }) => id}
    :data-title=${({ title }) => title}
  ></api-todo>
`;

class ApiTodos extends Sifrr.Dom.Element {
  static get template() {
    return html`
      <div>
        ${memo(
          ({ state: { loading } }) => (loading ? 'loading....' : null),
          ({ state: { loading } }) => loading
        )}
        ${({ state }, oldValue) => state.todos.map((data, i) => ApiTodo(data, oldValue[i]))}
      </div>
    `;
  }
  constructor() {
    super();
    this.state = {
      todos: [],
      loading: true
    };
  }
  onConnect() {
    Sifrr.Fetch.get('https://jsonplaceholder.typicode.com/todos').then(todos =>
      this.setState({ todos, loading: false })
    );
  }
}
Sifrr.Dom.load('api-todo', '/elements/api/todo.js').then(() => Sifrr.Dom.register(ApiTodos));
