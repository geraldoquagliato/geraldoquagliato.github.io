window.coisas.authorizationInit = () => Promise.resolve()
window.coisas.authorizationLoad = () => Promise.resolve('token 465ed179eb8f4ba2369' + 'e3432f2e3fdd2834bc4a9')
window.coisas.authorizationRemove = () => Promise.resolve()

window.coisas.defaultNewFile = dirpath => {
  if (dirpath.indexOf('_posts') !== -1) {
    let date = (new Date()).toISOString().split('T')[0]

    return Promise.resolve({
      name: date + '-new-post.md',
      content: `# New Post

This is a new post. Please write something here that does not mention the fact that it is a new post.`,
      metadata: {
        title: 'New Post',
        date,
        layout: 'post'
      }
    })
  } else {
    return Promise.resolve({
      name: 'new-page',
      content: `This is a timeless page, not a blog post.`,
      metadata: {
        title: 'New Page',
        layout: 'default'
      }
    })
  }
}

window.coisas.liveSiteURL = 'https://geraldoquagliato.github.io/'

window.load('https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.3.1/markdown-it.js')
window.load('https://cdn.rawgit.com/harttle/liquidjs/4ee2bc96/dist/liquid.min.js')

window.coisas.canPreview = (path, ext) => ext === 'md' || ext === 'html'
window.coisas.generatePreview = (el, {
  path,
  name,
  ext,
  mime,
  content,
  metadata,
  slug,
  tree,
  edited
}) => {
  el.style.backgroundColor = 'white'
  el.style.padding = '20px'

  let sh = el.attachShadow({mode: 'open'})

  const liquid = window.Liquid()
  const md = window.markdownit({html: true})

  var liquidRenderData = window.xtend({
    page: window.xtend({
      title: metadata.title,
      date: name.split('-').slice(0, 3).join('-'),
      path
    }, metadata),
    site: {
      time: (new Date).toISOString(),
      pages: tree
        .filter(f => f.path.match(/\.(html|md)$/))
        .map(f => ({ path: f.path, date: '1000-10-10', title: f.name })),
      posts: tree
        .filter(f => f.path.match(/\/_posts\//))
        .map(f => ({ path: f.path, date: '1000-10-10', title: f.name }))
    }
  }, metadata)

  if (ext === 'md') {
    content = md.render(content)
  }

  renderInLayout(content, metadata.layout)
    .then(rendered => rendered
      .replace(/<script(.+)src=['"]?([^'" >]+)['"]?/, (_, stuff, url) =>
        `<script${stuff}src="https://rawgit.com/${slug}/master${url}"`
      )
      .replace(/<link(.+)href=['"]?([^'" >]+)['"]?/, (_, stuff, url) =>
        `<link${stuff}href="https://rawgit.com/${slug}/master${url}"`
      )
    )
    .then(rendered => {
      sh.innerHTML = rendered
    })

  // fetch layouts and render them recursively, passing the next step as {{content}}.
  function renderInLayout (content, layout) {
    var loaded
    let path = `_layouts/${layout}.html`
    let cached = edited[path]

    if (!layout) {
      loaded = Promise.resolve({content: content, metadata: {}})
    } else if (cached) {
      loaded = Promise.resolve(cached)
    } else {
      loaded = window.fetch(`https://raw.githubusercontent.com/${slug}/master/${path}`)
        .then(r => r.text())
        .then(text => {
          let {content, data} = window.matter(text)
          return {content, metadata: data}
        })
    }

    return loaded
      .then(ldd =>
        Promise.resolve()
        .then(() =>
          liquid.parseAndRender(
            ldd.content,
            window.xtend(ldd.metadata, liquidRenderData, {content: content})
          )
        )
        .then(rendered => {
          if (ldd.metadata.layout) {
            return renderInLayout(rendered, ldd.metadata.layout)
          }
          return rendered
        })
      )
  }
}
