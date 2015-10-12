> Summary: While modulecounts.com reports 94K+ Go packages the actual number is ~24K

For a little while now I've been bothered by the GoDoc numbers reported on Module Counts.

Other ecosystems, no matter what size they are or how fast they are growing, exhibit fairly stable numbers while GoDoc's are very erratic. You can see what I mean by look at the last year's worth of data.

![Module Counts](/screenshot.png)

This weekend I decided to investigate a bit. The first thing I realized is that GoDoc isn't a package registry at all, **it's a documentation site** that [collects documentation for Go packages across Bitbucket, GitHub, Launchpad and Google Project Hosting](https://godoc.org/-/about). In fact, the number reported on Module Counts can't be found anywhere on their website, the number is collected by simply counting the number of links on the site's index. Which brings us to our first issue.

> Not all links being reported are for packages.

I decided to scrape all the data I could off of GoDocs and the first thing I noticed is that many links aren't to packages but to "applications" which contain a variety of "packages" inside them. These don't have an analog in other package managers because, again, GoDoc is not a package registry.

*Example:* the first link in GoDoc's index is to the "camlistatic" command "0f.io/camlistatic", which contains a single package, "0f.io/camlistatic/fusetohttp," which is the next link in the index. It makes perfect sense for the documentation to be split in to two pages but these are one package, one being the module you can import and the other being the accompanying command line application, but are being reported as two.

When I ran my scraper 94090 packages were reported, meaning there were 94090 links in the site index. Of those 13 had html that wasn't parsable by cheerio which I was using for parsing (no idea what's up there). Of the remaining links, 90069 were actual packages and 4008 were some kind of application.

Within each actual package you can find an external link to where the files are hosted. I was curious where people tended to host their Go packages so I reduced the domain names found in the packages.

* github.com: *86912* **(96%)**
* bitbucket.org: *804*
* code.google.com: *797*
* bazaar.launchpad.net: *356*
* other: *1200*

Like most of modern open source the lion's share (96%) is on GitHub. Because GitHub's url structure is standardized I quickly noticed another problem.

> A single repository of Go code is reported as many packages.

Across Ruby, Python and Node.js I know of only a handful of cases where a single repository contains multiple "packages" by the standard definition of a package. Looking through a few Go repos the code and repos are comparable to what you'd find in other languages per repo. Again, GoDoc is a *documentation* service and not a package registry so it documents each directory of Go code independently.

> Of the 86912 packages reported to be on GitHub there are only 28315 unique repositories.

So now we're down to a third of what was originally reported and I noticed another trend. A lot of repo names were the same and the names weren't all that common. A quick reduce of the unique repo names showed there were only 18540 unique names. I wondered if many of these packages were forks of each other so I decided to hit the GitHub API to find out.

Of the 28315 unique repos 172 returned 404's. Of the remaining there were 23294 unique parent repos (not forks). That's about 27% of the number being reported for GitHub. If we assume the other providers have similar issues we end up with an estimate of only 24140 real packages for the 94090 being reported.

Being that Node.js and Go are roughly the same age, having been released within 6 months of each other, this number seems pretty small compared to Node.js' 190K+ packages but actually 24K packages is nothing to be dismissed. This means that in about 6 years Go has achieved more than double the ecosystem of Haskell (~8800) and is closing in on double that of Clojure (~14K). If you compare Go to other languages that are doing well in a few verticals Go is doing quite well and you could see it growing it's base and getting as large as Python given enough time, it just isn't in the same level of adoption that Java, PHP, and JavaScript are in and unless something dramatic happens it never will be.

Still, there's a few things the Go community should probably do.

1. Build a package manager with a real package registry. Not just for better metrics but also as a vehicle to encourage adoption and code re-use.
2. Remove GoDocs from Module Counts. No number is probably better than a number that is reporting almost 4x the reality.

This may all sound like I'm putting Go down but there's a lot to be excited about. It's definitely growing at a good rate. It's almost entirely on GitHub which is a huge advantage over languages that aren't and it also means that if we were to process some GitHub data we'd have *very* good metrics on its growth rate and the number of people engaged in Go's open source ecosystem. And most importantly, Go has already escaped the lower tiers of open source ecosystem adoption and is in no way in danger of being ignored outside of a small vertical like Haskell and R (not putting them down, they're just not interested in being broadly used).
