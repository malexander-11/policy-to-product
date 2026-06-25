import { Link } from 'react-router-dom'
import { GovukLogo } from './GovukLogo'

// Replicates the official GOV.UK Frontend footer: 10px blue top border, Tudor
// Crown, support links, the Open Government Licence logo + statement, and the
// Royal Arms crest above the Crown copyright link.

const linkClass = 'govuk-link text-govblue underline underline-offset-2 hover:text-govblue-dark hover:decoration-2'

export function Footer() {
  const crest = `${import.meta.env.BASE_URL}govuk-crest.svg`

  return (
    <footer className="mt-12 border-t-[10px] border-govblue bg-lightgrey text-ink">
      <div className="container-page py-10">
        <div className="mb-6 text-ink">
          <GovukLogo crownOnly />
        </div>

        <nav aria-label="Footer" className="mb-8 border-b border-line pb-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-base">
            <li>
              <Link className={linkClass} to="/">
                Report a repair
              </Link>
            </li>
            <li>
              <Link className={linkClass} to="/ops">
                Council Ops
              </Link>
            </li>
            <li>
              <Link className={linkClass} to="/performance">
                Performance data
              </Link>
            </li>
            <li>
              <a className={linkClass} href={`${import.meta.env.BASE_URL}presentation.html`}>
                The thinking behind this
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="max-w-2xl">
            <svg
              aria-hidden="true"
              focusable="false"
              className="mr-2 inline-block align-top"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 483.2 195.7"
              height="17"
              width="41"
            >
              <path
                fill="currentColor"
                d="M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145"
              />
            </svg>
            <span className="text-base">
              All content is available under the{' '}
              <a
                className={linkClass}
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license noopener noreferrer"
                target="_blank"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated. This is a prototype — all cases and data shown are mock data.
            </span>
          </div>

          <div className="text-center">
            <a
              className="inline-block text-ink no-underline hover:underline"
              href="https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img src={crest} alt="" width={125} height={102} className="mx-auto mb-2 block" />
              <span className="text-base">© Crown copyright</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
