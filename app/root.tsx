import {
  Form,
  json,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import appStylesHref from './app.css'
import { createEmptyContact, getContacts } from './data'
import React from 'react'

export const loader = async ({request} : LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')
  const contacts = await getContacts(q)

  return json({contacts, q})
}

export const action = async () => {
  const contact = await createEmptyContact()
  return redirect(`/contacts/${contact.id}/edit`)
}

// link でcss ファイルを読み込む
export const links : LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: appStylesHref,
  }
]


export default function App() {
  const {contacts, q} = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const submit = useSubmit()
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      'q'
    )

  return (
    <html lang="en">
    <head>
      <title>Remix Starter</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body>
    <div id="sidebar">
      <h1>Remix Contacts</h1>
      <div>
        <Form
          id="search-form"
          role="search"
          onChange={
            (event) => {
              const isFirstSearch = q === null
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              })
            }
          }>
          <input
            id="q"
            className={searching ? 'loading' : ''}
            defaultValue={q || ''}
            aria-label="Search contacts"
            placeholder="Search"
            type="search"
            name="q"
          />
          <div id="search-spinner" aria-hidden hidden={!searching} />
        </Form>
        <Form method="post">
          <button type="submit">New</button>
        </Form>
      </div>
      <nav>
        {contacts.length ? (
          <ul>
            {contacts.map((contact : any) => (
              <li key={contact.id}>
                <NavLink
                  to={`contacts/${contact.id}`}
                  className={({isActive, isPending}) => isActive ? 'active' : isPending ? 'pending' : ''}
                >
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{' '}
                  {contact.favorite ? (
                    <span>★</span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <i>No contacts</i>
          </p>
        )}
      </nav>
    </div>
    <div
      className={
        navigation.state === 'loading' && !searching
          ? 'loading'
          : ''
      }
      id="detail">
      <Outlet />
    </div>

    <ScrollRestoration />
    <Scripts />
    <LiveReload />
    </body>
    </html>
  )
}
