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

window.liveSiteURL = 'https://geraldoquagliato.github.io/'