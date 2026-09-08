import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  OG_IMAGE_ALT,
  SITE_NAME,
  SITE_URL,
} from '../data/site'

function upsertMeta(attr, key, content) {
  if (content == null) return
  const el = [...document.head.querySelectorAll(`meta[${attr}]`)].find(
    (node) => node.getAttribute(attr) === key,
  )
  if (el) {
    el.setAttribute('content', content)
    return
  }
  const created = document.createElement('meta')
  created.setAttribute(attr, key)
  created.setAttribute('content', content)
  document.head.appendChild(created)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function pageMeta(pathname, product) {
  if (pathname === '/account') {
    return {
      title: `Account — ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      robots: 'noindex, nofollow',
      type: 'website',
    }
  }
  if (pathname === '/landing') {
    return {
      title: `${SITE_NAME} — Research catalog`,
      description: DEFAULT_DESCRIPTION,
      robots: 'index, follow',
      type: 'website',
    }
  }
  if (pathname.startsWith('/product/') && product) {
    const description =
      product.sub ||
      product.story ||
      (product.description ? String(product.description).slice(0, 160) : '') ||
      DEFAULT_DESCRIPTION
    return {
      title: `${product.name} — ${SITE_NAME}`,
      description,
      robots: 'index, follow',
      type: 'product',
    }
  }
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    robots: 'index, follow',
    type: 'website',
  }
}

export default function Seo() {
  const { pathname } = useLocation()
  const { getProduct } = useProducts()
  const productId = pathname.startsWith('/product/')
    ? pathname.split('/')[2]
    : null
  const product = productId ? getProduct(productId) : null

  useEffect(() => {
    const { title, description, robots, type } = pageMeta(pathname, product)
    const canonical =
      pathname === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathname}`

    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', robots)
    upsertMeta('name', 'application-name', SITE_NAME)
    upsertMeta('name', 'apple-mobile-web-app-title', SITE_NAME)
    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', OG_IMAGE)
    upsertMeta('property', 'og:image:alt', OG_IMAGE_ALT)
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:locale', 'en_AU')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', OG_IMAGE)
    upsertMeta('name', 'twitter:image:alt', OG_IMAGE_ALT)
  }, [pathname, product])

  return null
}
