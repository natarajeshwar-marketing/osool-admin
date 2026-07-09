import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Percent,
} from "lucide-react"
import type { Crew, Building } from "@/types"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"



// Helper functions for date calculations
const getStartOfCurrentWeek = (date: Date) => {
  const result = new Date(date)
  const day = result.getDay() // 0 = Sun, 1 = Mon, ..., 4 = Thu, ...
  // Diff to make week start on Thursday (4)
  const diff = (day >= 4) ? (4 - day) : (4 - day - 7)
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th"
  switch (day % 10) {
    case 1:  return "st"
    case 2:  return "nd"
    case 3:  return "rd"
    default: return "th"
  }
}
interface ServiceItem {
  id: string
  name: string
  category: string
  pricingType: string
  rate: number
  status: "Active" | "Inactive"
  description?: string
}

export default function AddSchedule() {
  const navigate = useNavigate()

  const [servicesList, setServicesList] = useState<ServiceItem[]>([])

  // --- States ---

  
  // Date states
  const [startDate, setStartDate] = useState<Date>(() => getStartOfCurrentWeek(new Date()))
  const [activeDayIndex, setActiveDayIndex] = useState<number>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = getStartOfCurrentWeek(new Date())
    const diffTime = today.getTime() - weekStart.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 7) {
      return diffDays
    }
    return 0
  }) // 0 to 6 representing Thursday to Wednesday

  // Week navigation handlers
  const handlePrevWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() - 7)
    setStartDate(newStart)
    toast.info("Navigated to previous week")
  }

  const handleNextWeek = () => {
    const newStart = new Date(startDate)
    newStart.setDate(startDate.getDate() + 7)
    setStartDate(newStart)
    toast.info("Navigated to next week")
  }

  // Derive week label dynamically
  const currentWeekLabel = useMemo(() => {
    const end = new Date(startDate)
    end.setDate(startDate.getDate() + 6)
    
    const startDay = startDate.toLocaleDateString("en-US", { weekday: "short" })
    const startNum = startDate.getDate()
    const startMonth = startDate.toLocaleDateString("en-US", { month: "short" })
    
    const endDay = end.toLocaleDateString("en-US", { weekday: "short" })
    const endNum = end.getDate()
    const endMonth = end.toLocaleDateString("en-US", { month: "short" })
    
    return `${startDay} ${startNum} ${startMonth} - ${endDay} ${endNum} ${endMonth}`
  }, [startDate])

  // Derive date tabs dynamically
  const dateTabs = useMemo(() => {
    const tabs = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      
      const dayNum = d.getDate()
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" })
      const suffix = getOrdinalSuffix(dayNum)
      
      tabs.push({
        id: i,
        dayLabel: weekday,
        numLabel: `${dayNum}${suffix}`,
        date: d
      })
    }
    return tabs
  }, [startDate])

  const activeDate = useMemo(() => {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + activeDayIndex)
    return d
  }, [startDate, activeDayIndex])

  // Column 3: Services & Calculations
  const [frequency, setFrequency] = useState<string>("one-time")
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([])
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("09:30")
  
  const [selectedService, setSelectedService] = useState<string>("HVAC Service")
  const [pricingType, setPricingType] = useState<string>("per-service")

  useEffect(() => {
    apiClient("/services")
      .then(res => res.json())
      .then(data => {
        setServicesList(data)
        const active = data.filter((s: ServiceItem) => s.status === "Active")
        if (active.length > 0) {
          setSelectedService(prev => {
            const exists = active.some((s: ServiceItem) => s.name === prev)
            return exists ? prev : active[0].name
          })
        }
      })
      .catch(err => console.error("Failed to fetch services", err))
  }, [])

  // Keep pricingType synced with selectedService
  useEffect(() => {
    const s = servicesList.find(item => item.name === selectedService)
    if (s) {
      setPricingType(s.pricingType)
      setPrice(s.rate)
    }
  }, [selectedService, servicesList])

  // Auto-enable and expand Contract End Date if frequency is monthly
  useEffect(() => {
    if (frequency === "monthly") {
      setHasContractEndDate(true)
      setIsContractExpanded(true)
    }
  }, [frequency])
  
  const [discountType, setDiscountType] = useState<"Amount" | "Percent">("Amount")
  const [discountValInput, setDiscountValInput] = useState<string>("0")
  const [appliedDiscountVal, setAppliedDiscountVal] = useState<number>(0)
  const [appliedDiscountType, setAppliedDiscountType] = useState<"Amount" | "Percent">("Amount")
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(0)
  
  const [taxRate, setTaxRate] = useState<number>(15) // Editable tax rate, default 15%
  const [isTaxEditOpen, setIsTaxEditOpen] = useState<boolean>(false)
  const [taxInputVal, setTaxInputVal] = useState<string>("15")
  
  const [confirmedBooking, setConfirmedBooking] = useState<boolean>(true)
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")

  // Column 4: Other Options
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [notes, setNotes] = useState<string>("")

  // Building search states
  const [buildings, setBuildings] = useState<Building[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  
  const [buildingQuery, setBuildingQuery] = useState<string>("")
  const [isBuildingDropdownOpen, setIsBuildingDropdownOpen] = useState<boolean>(false)

  const [zoneQuery, setZoneQuery] = useState<string>("")
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState<boolean>(false)

  const [apartmentQuery, setApartmentQuery] = useState<string>("")
  const [isApartmentDropdownOpen, setIsApartmentDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    apiClient("/crews")
      .then(res => res.json())
      .then(data => setCrews(data))
      .catch(err => console.error("Failed to fetch crews", err))

    apiClient("/buildings")
      .then(res => res.json())
      .then(data => setBuildings(data))
      .catch(err => console.error("Failed to fetch buildings", err))
  }, [])

  // Filtered lists for dropdown suggestions
  const filteredBuildings = useMemo(() => {
    if (!buildingQuery) return buildings;
    return buildings.filter(b => 
      (b.name && b.name.toLowerCase().includes(buildingQuery.toLowerCase())) ||
      (b.buildingNumber && b.buildingNumber.toLowerCase().includes(buildingQuery.toLowerCase()))
    );
  }, [buildings, buildingQuery])

  const filteredZones = useMemo(() => {
    const zones = Array.from(new Set(buildings.map(b => b.zone).filter(Boolean))) as string[];
    if (!zoneQuery) return zones;
    return zones.filter(z => z.toLowerCase().includes(zoneQuery.toLowerCase()));
  }, [buildings, zoneQuery])

  const filteredApartments = useMemo(() => {
    let list = buildings;
    if (zoneQuery) {
      list = list.filter(b => b.zone === zoneQuery);
    }
    const apartments = Array.from(new Set(list.map(b => b.apartmentNumber).filter(Boolean))) as string[];
    if (!apartmentQuery) return apartments;
    return apartments.filter(apt => apt.toLowerCase().includes(apartmentQuery.toLowerCase()));
  }, [buildings, zoneQuery, apartmentQuery])

  // Select handlers
  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b)
    setBuildingQuery(b.name || "")
    setZoneQuery(b.zone || "")
    setApartmentQuery(b.apartmentNumber || "")
    setIsBuildingDropdownOpen(false)
    setIsZoneDropdownOpen(false)
    setIsApartmentDropdownOpen(false)
    toast.info(`Selected Building: ${b.name}`)
  }

  const handleSelectZone = (z: string) => {
    setZoneQuery(z)
    setIsZoneDropdownOpen(false)
    if (selectedBuilding && selectedBuilding.zone !== z) {
      setSelectedBuilding(null)
      setBuildingQuery("")
    }
  }

  const handleSelectApartment = (apt: string) => {
    setApartmentQuery(apt)
    setIsApartmentDropdownOpen(false)
    const matchingBuilding = buildings.find(b => 
      b.apartmentNumber === apt && 
      (!zoneQuery || b.zone === zoneQuery)
    )
    if (matchingBuilding) {
      setSelectedBuilding(matchingBuilding)
      setBuildingQuery(matchingBuilding.name || "")
      setZoneQuery(matchingBuilding.zone || "")
    }
  }

  // Click outside handler
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsBuildingDropdownOpen(false)
      setIsZoneDropdownOpen(false)
      setIsApartmentDropdownOpen(false)
    }
    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  // Contract accordion states
  const [isContractExpanded, setIsContractExpanded] = useState<boolean>(false)
  const [hasContractEndDate, setHasContractEndDate] = useState<boolean>(false)
  const [contractEndDate, setContractEndDate] = useState<string>("11/07/2026")

  // Calculate Duration
  const durationText = useMemo(() => {
    if (!startTime || !endTime) return "0 h 0 min"
    try {
      const [startH, startM] = startTime.split(":").map(Number)
      const [endH, endM] = endTime.split(":").map(Number)
      
      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM)
      if (diffMinutes < 0) diffMinutes += 24 * 60 // handles overnight schedules

      const hours = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      return `${hours} h ${mins} min`
    } catch {
      return "0 h 0 min"
    }
  }, [startTime, endTime])

  const baseCost = useMemo(() => {
    return price * quantity
  }, [price, quantity])

  const appliedDiscount = useMemo(() => {
    if (appliedDiscountType === "Percent") {
      return baseCost * (appliedDiscountVal / 100)
    }
    return appliedDiscountVal
  }, [baseCost, appliedDiscountVal, appliedDiscountType])

  const untaxedAmount = useMemo(() => {
    const total = baseCost - appliedDiscount
    return total < 0 ? 0 : total
  }, [baseCost, appliedDiscount])

  const taxAmount = useMemo(() => {
    return Math.round((untaxedAmount * (taxRate / 100)) * 100) / 100
  }, [untaxedAmount, taxRate])

  const totalAmount = useMemo(() => {
    return Math.round((untaxedAmount + taxAmount) * 100) / 100
  }, [untaxedAmount, taxAmount])

  // Handlers
  const handleApplyDiscount = () => {
    const val = parseFloat(discountValInput) || 0
    if (val < 0) {
      toast.error("Discount value cannot be negative")
      return
    }
    if (discountType === "Percent") {
      if (val > 100) {
        toast.error("Discount percentage cannot exceed 100%")
        return
      }
      setAppliedDiscountVal(val)
      setAppliedDiscountType("Percent")
      const calculatedDiscount = baseCost * (val / 100)
      toast.success(`Discount of ${val}% (SAR ${calculatedDiscount.toFixed(2)}) applied successfully!`)
    } else {
      if (val > baseCost) {
        toast.error("Discount value cannot exceed base cost")
        return
      }
      setAppliedDiscountVal(val)
      setAppliedDiscountType("Amount")
      toast.success(`Discount of SAR ${val.toFixed(2)} applied successfully!`)
    }
  }

  const handleApplyTax = () => {
    const val = parseFloat(taxInputVal)
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("Please enter a valid tax percentage between 0 and 100")
      return
    }
    setTaxRate(val)
    setIsTaxEditOpen(false)
    toast.success(`Tax rate updated to ${val}%`)
  }

  const handleWeekdayToggle = (day: string) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    )
  }

  const handleDone = () => {
    if (frequency === "monthly" && !hasContractEndDate) {
      toast.error("Contract end date is required for monthly schedules.")
      return
    }

    if (selectedCrewIds.length === 0) {
      toast.warning("No crew assigned yet. You can still save this schedule.")
    }

    const selectedServiceObj = servicesList.find((s) => s.name === selectedService)
    const serviceCategory = selectedServiceObj ? selectedServiceObj.category : null

    const payload = {
      buildingNumber: selectedBuilding?.buildingNumber || buildingQuery || "",
      zone: selectedBuilding?.zone || zoneQuery || "",
      apartmentNumber: selectedBuilding?.apartmentNumber || apartmentQuery || "",
      tenantName: selectedBuilding?.tenantName || "",
      apartmentType: selectedBuilding?.type || "",
      phoneNumber: selectedBuilding?.contactNumber || "",
      emailAddress: selectedBuilding?.emailAddress || "",
      date: activeDate.getDate(),
      month: activeDate.getMonth() + 1,
      year: activeDate.getFullYear(),
      frequency,
      repeatDays: frequency !== "one-time" ? selectedWeekdays : [],
      startTime,
      endTime,
      serviceName: selectedService,
      serviceCategory,
      buildingId: selectedBuilding?.id || null,
      crews: selectedCrewIds,
      notes,
      discount: appliedDiscount,
      baseCost: baseCost,
      quantity,
      vat: taxAmount,
      totalCost: totalAmount,
      confirmedBooking,
      paymentMethod,
      contractEndDate: hasContractEndDate ? contractEndDate : undefined,
    }

    console.log("Saving schedule payload:", payload)

    apiClient("/schedules", {
      method: "POST",
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save schedule")
        return res.json()
      })
      .then(() => {
        toast.success("Schedule Created successfully!", {
          description: `Job: ${payload.serviceName} is scheduled for ${payload.tenantName || 'New Schedule'}.`
        })
        setTimeout(() => {
          navigate("/schedules/calendar")
        }, 1500)
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to save schedule to database.")
      })
  }

  return (
    <div className="space-y-6 pb-20">
      {/* --- TOP CUSTOMER NAVBAR TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
        {/* Left Search Selectors */}
        <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Input
              placeholder="Search Building..."
              value={buildingQuery}
              onChange={(e) => {
                setBuildingQuery(e.target.value)
                setIsBuildingDropdownOpen(true)
              }}
              onFocus={(e) => {
                e.stopPropagation()
                setIsBuildingDropdownOpen(true)
                setIsZoneDropdownOpen(false)
                setIsApartmentDropdownOpen(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-72 text-xs font-semibold"
            />
            {isBuildingDropdownOpen && filteredBuildings.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredBuildings.map((b) => (
                  <div
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectBuilding(b)
                    }}
                    className="px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
                  >
                    <div className="font-semibold text-gray-700 dark:text-gray-300">{b.name}</div>
                    <div className="text-[10px] text-gray-400">Tenant: {b.tenantName || "N/A"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              placeholder="Search Zone..."
              value={zoneQuery}
              onChange={(e) => {
                setZoneQuery(e.target.value)
                setIsZoneDropdownOpen(true)
              }}
              onFocus={(e) => {
                e.stopPropagation()
                setIsZoneDropdownOpen(true)
                setIsBuildingDropdownOpen(false)
                setIsApartmentDropdownOpen(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-48 text-xs font-semibold"
            />
            {isZoneDropdownOpen && filteredZones.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredZones.map((z) => (
                  <div
                    key={z}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectZone(z)
                    }}
                    className="px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
                  >
                    {z}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              placeholder="Apartment No..."
              value={apartmentQuery}
              onChange={(e) => {
                setApartmentQuery(e.target.value)
                setIsApartmentDropdownOpen(true)
              }}
              onFocus={(e) => {
                e.stopPropagation()
                setIsApartmentDropdownOpen(true)
                setIsBuildingDropdownOpen(false)
                setIsZoneDropdownOpen(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-36 text-xs font-semibold"
            />
            {isApartmentDropdownOpen && filteredApartments.length > 0 && (
              <div className="absolute left-0 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {filteredApartments.map((apt) => (
                  <div
                    key={apt}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectApartment(apt)
                    }}
                    className="px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 text-left"
                  >
                    Apt {apt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info Area - Shifted Date Range Nav */}
        <div className="flex flex-wrap items-center gap-3 justify-end xl:w-auto w-full">
          <div className="flex items-center justify-center gap-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5 font-medium text-xs text-gray-700 dark:text-gray-300 px-1">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
              <span>{currentWeekLabel}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- WEEKDAY HORIZONTAL TABS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {dateTabs.map((tab) => {
          const isActive = activeDayIndex === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDayIndex(tab.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                isActive
                  ? "bg-[#ef801f] text-white border-[#ef801f] shadow-md transform scale-[1.02]"
                  : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <span className="text-xs uppercase font-medium tracking-wider opacity-85">
                {tab.dayLabel}
              </span>
              <span className="text-lg font-bold mt-1">
                {tab.numLabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* --- 2-COLUMN FORM WORKSPACE: 70% (7 spans) / 30% (3 spans) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
        
        {/* --- LEFT COLUMN: FREQUENCY, TIME, SERVICE, CREW, NOTES, CONTRACT (70%) --- */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs space-y-6 text-left">
          {/* --- SECTION 1: FREQUENCY & TIME --- */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block border-b pb-1">
              Frequency and time
            </span>

            {/* Selected Building Details Display */}
            {selectedBuilding ? (
              <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-200/50 dark:border-orange-900/30 rounded-xl p-4 space-y-3">
                <span className="text-[11px] font-bold text-[#ef801f] uppercase tracking-wider block">
                  Selected Unit Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Tenant Name</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedBuilding.tenantName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Apartment Type</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedBuilding.type || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phone Number</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate block">
                      {selectedBuilding.contactNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Email Address</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs truncate block">
                      {selectedBuilding.emailAddress || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-855 border-dashed rounded-xl p-4 text-center">
                <span className="text-xs text-gray-400">
                  Please search and select a building/apartment above to load tenant information.
                </span>
              </div>
            )}

            {/* Recurrence Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Frequency</label>
              <div className="grid grid-cols-4 gap-1.5 bg-gray-50 dark:bg-gray-900/60 p-1.5 rounded-xl border border-gray-150 dark:border-gray-850">
                {[
                  { value: "one-time", label: "One Time" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" }
                ].map((f) => {
                  const isActive = frequency === f.value
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFrequency(f.value)}
                      className={`py-2 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-[#ef801f] text-white shadow-sm transform scale-[1.02]"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/80"
                      }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Days buttons checklist - visible when frequency is weekly or monthly */}
            {(frequency === "weekly" || frequency === "monthly") && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Select repeat days</label>
                <div className="flex flex-wrap gap-1.5 bg-gray-50 dark:bg-gray-900/60 p-2 rounded-xl border border-gray-150 dark:border-gray-850">
                  {["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"].map((day) => {
                    const isSelected = selectedWeekdays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWeekdayToggle(day)}
                        className={`flex-1 min-w-[42px] h-9 text-xs font-bold rounded-lg transition-all duration-150 ${
                          isSelected
                            ? "bg-[#ef801f] text-white shadow-xs"
                            : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Time Picker and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-150 dark:border-gray-855">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#ef801f]" /> Start Time
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 text-xs font-semibold focus-visible:ring-[#ef801f] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-red-500" /> End Time
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 text-xs font-semibold focus-visible:ring-[#ef801f] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                />
              </div>
              <div className="md:col-span-2 flex justify-between items-center bg-[#ef801f]/5 dark:bg-[#ef801f]/10 border border-[#ef801f]/10 p-3 rounded-lg text-xs">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Estimated Duration:</span>
                <span className="font-bold text-[#ef801f] bg-white dark:bg-gray-950 px-2.5 py-1 rounded-md border border-[#ef801f]/20 shadow-xs">
                  {durationText}
                </span>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: SERVICE --- */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block border-b pb-1">
              Service
            </span>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Selected Service</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full h-9 text-xs border-[#ef801f] focus:ring-[#ef801f]">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesList.filter(s => s.status === 'Active').map(s => (
                      <SelectItem key={s.id || s.name} value={s.name} className="text-xs">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Pricing Type</label>
                <Select value={pricingType} onValueChange={setPricingType}>
                  <SelectTrigger className="w-full h-9 text-xs">
                    <SelectValue placeholder="Pricing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-service" className="text-xs">Per Service</SelectItem>
                    <SelectItem value="hourly" className="text-xs">Hourly Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-400 uppercase">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: CREW ASSIGNMENT --- */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block border-b pb-1">
              Crew for the job
            </span>

            <div className="space-y-2">
              <Select 
                onValueChange={(val) => {
                  if (val && !selectedCrewIds.includes(val)) {
                    setSelectedCrewIds(prev => [...prev, val])
                  }
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs border-[#ef801f] focus:ring-[#ef801f]">
                  <SelectValue placeholder="Select Crews" />
                </SelectTrigger>
                <SelectContent>
                  {crews.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.firstName} {c.lastName} ({c.role} - {c.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tag style displaying selected crews */}
              {selectedCrewIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCrewIds.map((cid) => {
                    const cr = crews.find(c => c.id === cid)
                    const crName = cr ? `${cr.firstName} ${cr.lastName}` : ""
                    return (
                      <Badge 
                        key={cid} 
                        className="bg-[#001e60]/10 text-[#001e60] dark:bg-blue-900/20 dark:text-blue-300 border border-[#001e60]/20 flex items-center gap-1 py-0.5"
                      >
                        {crName}
                        <button 
                          className="hover:bg-red-200 rounded-full p-0.5" 
                          onClick={() => setSelectedCrewIds(prev => prev.filter(id => id !== cid))}
                        >
                          <span className="text-[9px] font-bold">×</span>
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* --- SECTION 4: NOTES --- */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
            <div className="flex justify-between items-center border-b pb-1">
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                Notes
              </span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{notes ? "Yes" : "No"}</span>
            </div>

            <Textarea
              placeholder="Notes (Crew will be able to see these notes)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs h-20 resize-none"
            />
          </div>

          {/* --- SECTION 5: CONTRACT ACCORDION --- */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
            <div 
              onClick={() => setIsContractExpanded(!isContractExpanded)}
              className="flex items-center justify-between py-1.5 text-xs px-1 hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-sm cursor-pointer select-none border-b pb-1"
            >
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                Contract
              </span>
              <span className="font-bold text-[#ef801f] text-xs pr-2">
                {hasContractEndDate ? "Yes" : "No"}
              </span>
            </div>
            
            {isContractExpanded && (
              <div className="pl-4 pr-1 py-3 space-y-2 bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={hasContractEndDate} 
                      onCheckedChange={(checked: boolean) => setHasContractEndDate(checked)} 
                    />
                    <span className="text-gray-500 font-medium">Contract End Date</span>
                  </div>
                  <Input
                    type="text"
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="h-8 w-40 text-center text-xs bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:ring-0 focus:ring-offset-0 text-gray-700 dark:text-gray-300 font-semibold rounded-md shadow-2xs"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: DISCOUNT, CALCULATIONS, CONFIRMATION & PAYMENT (30%) --- */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xs space-y-6 text-left">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block border-b pb-1">
            Pricing & Calculations
          </span>

          {/* Pricing Discount Section */}
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-gray-400 uppercase block">Discount</label>

            <div className="flex gap-2">
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-900">
                <button
                  type="button"
                  onClick={() => setDiscountType("Amount")}
                  className={`px-3 py-1 text-xs font-medium transition-all ${
                    discountType === "Amount" 
                      ? "bg-[#ef801f] text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Amount
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("Percent")}
                  className={`px-3 py-1 text-xs font-medium transition-all ${
                    discountType === "Percent" 
                      ? "bg-[#ef801f] text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  (%)
                </button>
              </div>

              <div className="relative flex-1 flex">
                <span className="absolute left-2.5 top-2.5 text-xs text-gray-400 font-semibold">
                  {discountType === "Percent" ? "%" : "SAR"}
                </span>
                <Input
                  type="number"
                  value={discountValInput}
                  onChange={(e) => setDiscountValInput(e.target.value)}
                  className={`pr-2 h-9 text-xs rounded-r-none border-r-0 no-spinner ${
                    discountType === "Percent" ? "pl-7" : "pl-10"
                  }`}
                  placeholder="0"
                />
                <Button 
                  onClick={handleApplyDiscount} 
                  className="bg-[#ef801f] hover:bg-[#c2410c] text-white h-9 rounded-l-none px-3 text-xs"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Subtotal Calculation details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-3 text-xs border border-gray-100 dark:border-gray-900">
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-400">Price:</span>
              <div className="relative flex items-center w-28">
                <span className="absolute left-1.5 text-[10px] text-gray-400 font-semibold">SAR</span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price || ""}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="pl-8 pr-1.5 h-7 text-xs text-right font-medium w-full focus-visible:ring-[#ef801f] no-spinner"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Quantity:</span>
              <span className="font-medium text-gray-950 dark:text-gray-50">{quantity}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
              <span className="text-gray-400">Base Cost:</span>
              <span className="font-medium text-gray-950 dark:text-gray-50">SAR {baseCost.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-red-500">
                <span>Discount Applied:</span>
                <span className="font-medium">- SAR {appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
              <span className="text-gray-400 flex items-center gap-1">
                Untaxed Amount:
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 text-[#ef801f] hover:bg-transparent"
                  onClick={() => {
                    setTaxInputVal(String(taxRate))
                    setIsTaxEditOpen(true)
                  }}
                  title="Change tax rate"
                >
                  <Percent className="h-3 w-3" />
                </Button>
              </span>
              <span className="font-medium text-gray-950 dark:text-gray-50">SAR {untaxedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">VAT ({taxRate}%):</span>
              <span className="font-medium text-gray-950 dark:text-gray-50">SAR {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t font-bold text-sm text-gray-800 dark:text-gray-200">
              <span>Total Cost:</span>
              <span className="text-[#ef801f] text-base">SAR {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Confirmed Booking & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex justify-between items-center border border-gray-150 dark:border-gray-800 rounded-lg p-2.5">
              <span className="text-xs font-semibold text-gray-500">Confirmed Booking</span>
              <Switch checked={confirmedBooking} onCheckedChange={setConfirmedBooking} />
            </div>

            <div className="space-y-1.5">
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full h-10 text-xs">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash" className="text-xs">Cash</SelectItem>
                  <SelectItem value="card" className="text-xs">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank" className="text-xs">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM STICKY ACTION FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-40">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 text-gray-500 border-gray-300 hover:bg-gray-100"
          onClick={() => {
            toast.info("Schedule overview calendar sidebar is toggled.")
          }}
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="text-gray-500 hover:bg-gray-100 text-xs font-semibold h-9 px-4"
            onClick={() => {
              toast.info("Action cancelled")
              navigate(-1)
            }}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#ef801f] hover:bg-[#c2410c] text-white text-xs font-semibold h-9 px-5 flex items-center gap-1"
            onClick={handleDone}
          >
            Done <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>



      {/* --- EDIT TAX DIALOG --- */}
      <Dialog open={isTaxEditOpen} onOpenChange={setIsTaxEditOpen}>
        <DialogContent className="sm:max-w-[300px]">
          <DialogHeader>
            <DialogTitle>Configure Tax Percentage</DialogTitle>
            <DialogDescription>
              Set the VAT rate for this operational schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-left space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">VAT (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={taxInputVal}
              onChange={(e) => setTaxInputVal(e.target.value)}
              className="text-xs h-9"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" className="text-xs h-9" onClick={() => setIsTaxEditOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[#ef801f] hover:bg-[#c2410c] text-white text-xs h-9" onClick={handleApplyTax}>
              Update Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
