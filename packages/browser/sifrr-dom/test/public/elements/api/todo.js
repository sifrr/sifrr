const { css, html, memo } = Sifrr.Template;

const CSS = css`
  div.loading {
    background: #f6f7f9;
    overflow: hidden;
    margin: 8px 0;
  }
  div.loading p {
    background-image: linear-gradient(to right, #f6f7f9 0%, #e9ebee 20%, #f6f7f9 40%, #f6f7f9 100%);
    background-repeat: no-repeat;
    font-size: 16px;
    line-height: 20px;
    height: 24px;
    animation: placeHolderShimmer 1s linear 0s infinite;
    animation-fill-mode: forwards;
    margin: 0;
  }
  @keyframes placeHolderShimmer {
    from {
      transform: translateX(-50%);
    }
    to {
      transform: translateX(50%);
    }
  }
  div span {
    margin-right: 10px;
  }
`;
class ApiTodo extends Sifrr.Dom.Element {
  static get template() {
    return html`
      ${memo(() => {
        return CSS();
      })}
      <div class="${({ loading }) => (loading ? 'loading' : 'loaded')}">
        <p><span>${({ dataId }) => `${dataId} `}</span>${({ dataTitle }) => dataTitle}</p>
      </div>
    `;
  }
}
Sifrr.Dom.register(ApiTodo);
