"use client"

import { useState } from "react"
import { CalendarIcon, Plane, Search, Home as HomeIcon, Globe, ChevronDown, Check } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

const domesticAirports = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "BLR", city: "Bangalore", name: "Kempegowda International Airport" },
]

const indianCitiesInternational = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
]

const internationalAirports = [
  { code: "LON", city: "London", name: "London (All Airports)" },
  { code: "LHR", city: "London", name: "London Heathrow Airport" },
  { code: "DXB", city: "Dubai", name: "Dubai International Airport" },
]

interface Airport {
  code: string
  city: string
  name: string
}

export default function Home() {
  const [flightType, setFlightType] = useState<string>("domestic")
  const [from, setFrom] = useState<Airport | null>(null)
  const [to, setTo] = useState<Airport | null>(null)
  const [date, setDate] = useState<Date>()
  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showAllFlights, setShowAllFlights] = useState(false)

  const getFromAirports = () => {
    let airports
    if (flightType === "domestic") {
      airports = domesticAirports
    } else {
      
      airports = [...indianCitiesInternational, ...internationalAirports]
    }
    
    if (to) {
      return airports.filter(airport => airport.code !== to.code)
    }
    return airports
  }

  const getToAirports = () => {
    let airports
    if (flightType === "domestic") {
      airports = domesticAirports
    } else {
      
      airports = [...indianCitiesInternational, ...internationalAirports]
    }
    
    if (from) {
      return airports.filter(airport => airport.code !== from.code)
    }
    return airports
  }

  const handleFlightTypeChange = () => {
    const newType = flightType === "domestic" ? "international" : "domestic"
    setFlightType(newType)
    setFrom(null)
    setTo(null)
    setDate(undefined)
    setFlights([]) 
    setShowAllFlights(false) 
  }

  const handleSearch = async () => {
    if (!from || !to || !date) {
      if (!from) {
        alert('Please select your departure airport')
        return
      }
      if (!to) {
        alert('Please select your destination airport')
        return
      }
      if (!date) {
        alert('Please select your travel date')
        return
      }
    }

    if (from.code === to.code) {
      alert('Departure and destination airports cannot be the same. Please select different airports.')
      return
    }

    setLoading(true)
    setFlights([])
    setShowAllFlights(false) 

    try {
      
      const supportedDomesticRoutes = [
        { from: 'DEL', to: 'BOM' },
        { from: 'BOM', to: 'DEL' },
        { from: 'BLR', to: 'BOM' },
        { from: 'BOM', to: 'BLR' },
        { from: 'BLR', to: 'DEL' },
        { from: 'DEL', to: 'BLR' },
      ]
      
      const supportedInternationalRoutes = [
        { from: 'DEL', to: 'LON' },
        { from: 'DEL', to: 'LHR' }, 
        { from: 'LON', to: 'DEL' },
        { from: 'LHR', to: 'DEL' }, 
        { from: 'DEL', to: 'DXB' },
        { from: 'DXB', to: 'DEL' },
      ]
      
      const allSupportedRoutes = [
        ...supportedDomesticRoutes,
        ...supportedInternationalRoutes,
      ]
      
      const isSupportedRoute = 
        (flightType === 'domestic' && supportedDomesticRoutes.some(route => route.from === from.code && route.to === to.code)) ||
        (flightType === 'international' && supportedInternationalRoutes.some(route => route.from === from.code && route.to === to.code))
      
      if (isSupportedRoute) {
        const response = await fetch(`/api/flights?from=${from.code}&to=${to.code}`)
        const data = await response.json()
        setFlights(data.flights || [])
      } else {
        
        setFlights([])
        if (flightType === 'domestic') {
          alert('Sorry, flight data is currently available only for the following routes:\n\n• Delhi ↔ Mumbai\n• Mumbai ↔ Bangalore\n• Bangalore ↔ Delhi\n\nPlease try one of these routes.')
        } else {
          alert('Sorry, flight data is currently available only for the following routes:\n\n• Delhi ↔ London\n• Delhi ↔ Dubai\n\nPlease try one of these routes.')
        }
      }
    } catch (error) {
      console.error('Error fetching flights:', error)
      alert('Oops! Something went wrong while searching for flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const displayedFlights = showAllFlights ? flights : flights.slice(0, 6)
  const hasMoreFlights = flights.length > 6

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="border-2 shadow-2xl backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Plane className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Flight Search
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-sm">
              Find the best flights for your journey
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {}
            <div className="flex flex-col items-center space-y-4">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Flight Type
              </Label>
              <div
                onClick={handleFlightTypeChange}
                className="relative inline-flex items-center rounded-xl bg-muted/40 p-1.5 border border-border/60 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:bg-muted/60 hover:shadow-md group backdrop-blur-sm"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleFlightTypeChange()
                  }
                }}
              >
                {}
                <div
                  className={cn(
                    "absolute h-11 rounded-lg bg-primary shadow-lg shadow-primary/30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary before:via-primary/90 before:to-primary",
                    "after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-white/25 after:via-transparent after:to-transparent",
                    flightType === "domestic" 
                      ? "left-1.5 w-[calc(50%-0.375rem)]" 
                      : "left-[calc(50%+0.375rem)] w-[calc(50%-0.375rem)]"
                  )}
                />

                {}
                <div className="relative flex items-center gap-6 px-3">
                  {}
                  <div
                    className={cn(
                      "relative z-10 flex items-center gap-2.5 px-5 py-2.5 transition-all duration-300 min-w-[130px] justify-center",
                      flightType === "domestic"
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground/80"
                    )}
                  >
                    <HomeIcon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        flightType === "domestic" 
                          ? "scale-110 text-primary-foreground drop-shadow-sm" 
                          : "scale-100"
                      )}
                    />
                    <span className={cn(
                      "font-semibold text-sm whitespace-nowrap transition-all",
                      flightType === "domestic" && "drop-shadow-sm"
                    )}>
                      Domestic
                    </span>
                  </div>

                  {}
                  <div
                    className={cn(
                      "relative z-10 flex items-center gap-2.5 px-5 py-2.5 transition-all duration-300 min-w-[130px] justify-center",
                      flightType === "international"
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground/80"
                    )}
                  >
                    <Globe
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        flightType === "international" 
                          ? "scale-110 text-primary-foreground drop-shadow-sm rotate-12" 
                          : "scale-100"
                      )}
                    />
                    <span className={cn(
                      "font-semibold text-sm whitespace-nowrap transition-all",
                      flightType === "international" && "drop-shadow-sm"
                    )}>
                      International
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {}
              <div className="space-y-2">
                <Label htmlFor="from" className="text-sm font-medium">
                  From
                </Label>
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="from"
                      variant="outline"
                      role="combobox"
                      aria-expanded={fromOpen}
                      className={cn(
                        "w-full h-12 justify-between text-left font-normal text-base",
                        !from && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Plane className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {from ? `${from.code} - ${from.city}` : "Select airport"}
                        </span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup>
                          {getFromAirports().map((airport) => (
                            <CommandItem
                              key={airport.code}
                              value={`${airport.code} ${airport.city} ${airport.name}`}
                              onSelect={() => {
                                
                                if (to && to.code === airport.code) {
                                  setTo(null)
                                  alert('Departure and destination airports cannot be the same. Please select a different destination.')
                                }
                                setFrom(airport)
                                setFromOpen(false)
                              }}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{airport.code}</span>
                                    <span className="text-sm text-muted-foreground">-</span>
                                    <span className="text-sm font-medium">{airport.city}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {airport.name}
                                  </span>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  from?.code === airport.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="to" className="text-sm font-medium">
                  To
                </Label>
                <Popover open={toOpen} onOpenChange={setToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="to"
                      variant="outline"
                      role="combobox"
                      aria-expanded={toOpen}
                      className={cn(
                        "w-full h-12 justify-between text-left font-normal text-base",
                        !to && "text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Plane className="h-4 w-4 text-muted-foreground rotate-90 shrink-0" />
                        <span className="truncate">
                          {to ? `${to.code} - ${to.city}` : "Select airport"}
                        </span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandList>
                        <CommandEmpty>No airport found.</CommandEmpty>
                        <CommandGroup>
                          {getToAirports().map((airport) => (
                            <CommandItem
                              key={airport.code}
                              value={`${airport.code} ${airport.city} ${airport.name}`}
                              onSelect={() => {
                                
                                if (from && from.code === airport.code) {
                                  setFrom(null)
                                  alert('Departure and destination airports cannot be the same. Please select a different departure airport.')
                                }
                                setTo(airport)
                                setToOpen(false)
                              }}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{airport.code}</span>
                                    <span className="text-sm text-muted-foreground">-</span>
                                    <span className="text-sm font-medium">{airport.city}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {airport.name}
                                  </span>
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  to?.code === airport.code ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal text-base",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {}
            <Button
              onClick={handleSearch}
              size="lg"
              disabled={loading || !from || !to || !date}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="mr-2 h-5 w-5" />
              {loading ? "Searching..." : "Search Flights"}
            </Button>
          </CardContent>
        </Card>

        {}
        {flights.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              Available Flights ({flights.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {displayedFlights.map((flight, index) => (
                <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Plane className="h-5 w-5 text-primary" />
                            <span className="font-bold text-lg">{flight.airline}</span>
                          </div>
                          <span className="text-muted-foreground">|</span>
                          <span className="font-semibold text-lg">{flight.flightNumber}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Departure</p>
                            <p className="font-semibold text-lg">{flight.departureTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Arrival</p>
                            <p className="font-semibold text-lg">{flight.arrivalTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Duration</p>
                            <p className="font-semibold">{flight.duration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase mb-1">Route</p>
                            <p className="font-semibold">{from?.code} → {to?.code}</p>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <div className="text-center md:text-right">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Cash Price</p>
                          <p className="font-bold text-2xl text-primary">{flight.cashPrice}</p>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Points Price</p>
                          <p className="font-semibold text-lg">{flight.pointsPrice}</p>
                        </div>
                        <Button className="w-full md:w-auto mt-2">
                          Select Flight
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {}
            {hasMoreFlights && !showAllFlights && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowAllFlights(true)}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-semibold"
                >
                  Show More ({flights.length - 6} more flights)
                </Button>
              </div>
            )}
            
            {}
            {hasMoreFlights && showAllFlights && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={() => setShowAllFlights(false)}
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-base font-semibold"
                >
                  Show Less
                </Button>
              </div>
            )}
          </div>
        )}

        {flights.length === 0 && !loading && from && to && (
          <div className="mt-6 text-center text-muted-foreground">
            <p>No flights found. Try searching for DEL → BOM route.</p>
          </div>
        )}
      </div>
    </div>
  )
}
