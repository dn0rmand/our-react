const React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag === "function") {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise.then(value => {
          promiseCache.set(key, value);
          rerender();
        });
        return { tag: "h1", props: { children: ["I AM LOADING"] } };
      }
    }
    const element = { tag, props: { ...props, children } };
    console.log(element);
    return element;
  }
};

const render = (reactElement, container) => {
  const { tag, props } = reactElement;
  const domElement = !tag
    ? document.createTextNode(reactElement)
    : document.createElement(tag);
  if (props) {
    const { children, ...rest } = props;
    Object.keys(rest).forEach(p => {
      domElement[p] = props[p];
    });
    if (children) {
      children.forEach(child => {
        render(child, domElement);
      });
    }
  }
  container.appendChild(domElement);
  return domElement;
};

const rerender = () => {
  console.log(states);
  statesCursor = 0;
  const container = document.querySelector("#app");
  container.firstChild.remove();
  render(<App />, container);
};

const states = [];
let statesCursor = 0;

const useState = initialState => {
  const FROZENCURSOR = statesCursor;
  states[FROZENCURSOR] = states[FROZENCURSOR] || initialState;
  let setState = newState => {
    states[FROZENCURSOR] = newState;
    rerender();
  };
  statesCursor++;
  return [states[FROZENCURSOR], setState];
};

const promiseCache = new Map();
const createResource = (promiseFn, key) => {
  if (promiseCache.has(key)) {
    return promiseCache.get(key);
  }
  throw { promise: promiseFn(), key };
};

const Photo = () => {
  const dogPhotoUrl = createResource(
    () =>
      fetch("https://dog.ceo/api/breeds/image/random")
        .then(r => r.json())
        .then(payload => payload.message),
    "dogphoto"
  );
  return (
    <div>
      <img src={dogPhotoUrl} />
    </div>
  );
};

const App = () => {
  const [name, setName] = useState("person");
  const [count, setCount] = useState(0);
  return (
    <div className="react-2020">
      <h1>Hello, {name}!</h1>
      <input
        type="text"
        placeholder="name"
        value={name}
        onchange={e => setName(e.target.value)}
      />
      <p>
        <h2>The count is: {count}</h2>
        <button onclick={() => setCount(count + 1)}>+</button>
        <button onclick={() => setCount(count - 1)}>-</button>
      </p>
      <Photo />
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro molestiae
        praesentium ut sit cupiditate blanditiis amet voluptatibus nisi
        incidunt, voluptates placeat hic quam. Quas, earum assumenda explicabo
        veritatis suscipit eius.
      </p>
    </div>
  );
};

render(<App />, document.querySelector("#app"));
