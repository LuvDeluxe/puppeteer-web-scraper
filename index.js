const puppeteer = require('puppeteer')

async function scrapeIt() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const baseURL = 'https://dev.bg/?s=&post_type=job_listing'
  const jobs = []

  let currentPage = 1
  let hasNextPage = true
  let jobsToScrape = 5 // Set depending on how many relevant job listings you want to see

  while (hasNextPage && jobs.length < jobsToScrape) {
    const url = currentPage === 1 ? baseURL : `${baseURL}/page/${currentPage}/?s&post_type=job_listing`;
    await page.goto(url)

    const jobDetails = await page.$$('.job-list-item')

    for (const jobDetail of jobDetails) {
      const title = (await jobDetail.$eval('.job-title', element => element.textContent)).trim()
      const company = (await jobDetail.$eval('.company-name', element => element.textContent)).trim()
      const date = (await jobDetail.$eval('.date', element => element.textContent)).trim()
      const place = (await jobDetail.$eval('.badge', element => element.textContent)).trim().replace(/\s+/g, ' ')
      jobs.push({ title, company, date, place })

      if (jobs.length >= jobsToScrape) {
        break; // Stop scraping once you've collected enough jobs
      }
    }

    hasNextPage = await page.evaluate(() => {
      const nextPageButton = document.querySelector('.next')
      return !!nextPageButton
    })

    if (hasNextPage) {
      currentPage++
    }
  }

  console.log(jobs)

  await browser.close()
}

scrapeIt()
