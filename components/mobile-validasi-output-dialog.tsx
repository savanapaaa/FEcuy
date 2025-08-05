"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ImageIcon,
  Video,
  Music,
  File,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckSquare,
} from "lucide-react"

interface ContentItem {
  id: string
  type: "text" | "image" | "video" | "audio" | "document"
  title: string
  content?: string
  url?: string
  description?: string
  duration?: string
  size?: string
  format?: string
  isValidated?: boolean
  validationDecision?: "tayang" | "tidak_tayang"
  validationReason?: string
  validationNotes?: string
}

interface MobileValidasiOutputDialogProps {
  isOpen: boolean
  onClose: () => void
  submission: any
  onValidationSubmit: (data: {
    status: "validated" | "published" | "rejected"
    notes: string
    validatorId: string
    publishDate?: string
    publishedContent?: any[]
  }) => void
}

export function MobileValidasiOutputDialog({
  isOpen,
  onClose,
  submission,
  onValidationSubmit,
}: MobileValidasiOutputDialogProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [currentContentIndex, setCurrentContentIndex] = useState(0)
  const [validationNotes, setValidationNotes] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationSummary, setValidationSummary] = useState<{
    tayang: number
    tidakTayang: number
    total: number
  }>({ tayang: 0, tidakTayang: 0, total: 0 })

  // Initialize content items
  useEffect(() => {
    if (submission?.contentItems) {
      const items = submission.contentItems.map((item: any, index: number) => ({
        id: item.id || `content-${index}`,
        type: item.type || "text",
        title: item.title || item.judul || `Content ${index + 1}`,
        content: item.content || item.deskripsi,
        url: item.url || item.file,
        description: item.description || item.deskripsi,
        duration: item.duration,
        size: item.size,
        format: item.format,
        isValidated: false,
        validationDecision: undefined,
        validationReason: "",
        validationNotes: "",
      }))
      setContentItems(items)
    }
  }, [submission])

  // Update validation summary
  useEffect(() => {
    const tayang = contentItems.filter((item) => item.validationDecision === "tayang").length
    const tidakTayang = contentItems.filter((item) => item.validationDecision === "tidak_tayang").length
    const total = contentItems.length

    setValidationSummary({ tayang, tidakTayang, total })
  }, [contentItems])

  const handleContentValidation = (
    contentId: string,
    decision: "tayang" | "tidak_tayang",
    reason?: string,
    notes?: string,
  ) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === contentId
          ? {
              ...item,
              isValidated: true,
              validationDecision: decision,
              validationReason: reason || "",
              validationNotes: notes || "",
            }
          : item,
      ),
    )
  }

  const handleNextContent = () => {
    if (currentContentIndex < contentItems.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1)
    } else {
      setCurrentStep(1) // Move to summary step
    }
  }

  const handlePrevContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1)
    }
  }

  const handleSubmitValidation = async () => {
    try {
      setIsSubmitting(true)

      const publishedContent = contentItems
        .filter((item) => item.validationDecision === "tayang")
        .map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          url: item.url,
          validationNotes: item.validationNotes,
        }))

      const hasRejectedContent = contentItems.some((item) => item.validationDecision === "tidak_tayang")
      const hasApprovedContent = contentItems.some((item) => item.validationDecision === "tayang")

      let status: "validated" | "published" | "rejected"
      if (hasApprovedContent && publishDate) {
        status = "published"
      } else if (hasApprovedContent) {
        status = "validated"
      } else {
        status = "rejected"
      }

      await onValidationSubmit({
        status,
        notes: validationNotes,
        validatorId: "current-user", // Should be from auth context
        publishDate: publishDate || undefined,
        publishedContent: publishedContent.length > 0 ? publishedContent : undefined,
      })

      toast({
        title: "Success",
        description: `Validation completed successfully. Status: ${status}`,
      })

      onClose()
    } catch (error) {
      console.error("Error submitting validation:", error)
      toast({
        title: "Error",
        description: "Failed to submit validation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      case "document":
        return <File className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getValidationIcon = (decision?: string) => {
    switch (decision) {
      case "tayang":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "tidak_tayang":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const currentContent = contentItems[currentContentIndex]
  const progress = contentItems.length > 0 ? ((currentContentIndex + 1) / contentItems.length) * 100 : 0
  const allContentValidated = contentItems.every((item) => item.isValidated)

  if (!submission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span>Content Validation</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === 0 && currentContent && (
            <div className="h-full flex flex-col">
              {/* Progress Header */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Content {currentContentIndex + 1} of {contentItems.length}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {submission.noComtab}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Content Details */}
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {/* Content Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center space-x-2">
                        {getContentIcon(currentContent.type)}
                        <span>{currentContent.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentContent.description && (
                        <div>
                          <Label className="text-xs text-gray-500">Description</Label>
                          <p className="text-sm text-gray-700 mt-1">{currentContent.description}</p>
                        </div>
                      )}

                      {currentContent.content && (
                        <div>
                          <Label className="text-xs text-gray-500">Content</Label>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-3">{currentContent.content}</p>
                        </div>
                      )}

                      {currentContent.url && (
                        <div>
                          <Label className="text-xs text-gray-500">File/URL</Label>
                          <p className="text-sm text-blue-600 mt-1 truncate">{currentContent.url}</p>
                        </div>
                      )}

                      <div className="flex space-x-4 text-xs text-gray-500">
                        {currentContent.duration && <span>Duration: {currentContent.duration}</span>}
                        {currentContent.size && <span>Size: {currentContent.size}</span>}
                        {currentContent.format && <span>Format: {currentContent.format}</span>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Decision */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Validation Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex space-x-3">
                          <Button
                            variant={currentContent.validationDecision === "tayang" ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleContentValidation(currentContent.id, "tayang", "", currentContent.validationNotes)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Tayang
                          </Button>
                          <Button
                            variant={currentContent.validationDecision === "tidak_tayang" ? "destructive" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              handleContentValidation(
                                currentContent.id,
                                "tidak_tayang",
                                "",
                                currentContent.validationNotes,
                              )
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Tidak Tayang
                          </Button>
                        </div>

                        {currentContent.validationDecision === "tidak_tayang" && (
                          <div>
                            <Label htmlFor="reason" className="text-sm">
                              Reason for Rejection
                            </Label>
                            <Select
                              value={currentContent.validationReason}
                              onValueChange={(value) =>
                                handleContentValidation(
                                  currentContent.id,
                                  "tidak_tayang",
                                  value,
                                  currentContent.validationNotes,
                                )
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select reason" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                                <SelectItem value="poor_quality">Poor Quality</SelectItem>
                                <SelectItem value="incomplete_information">Incomplete Information</SelectItem>
                                <SelectItem value="policy_violation">Policy Violation</SelectItem>
                                <SelectItem value="technical_issues">Technical Issues</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="notes" className="text-sm">
                            Validation Notes (Optional)
                          </Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any additional notes..."
                            value={currentContent.validationNotes}
                            onChange={(e) =>
                              handleContentValidation(
                                currentContent.id,
                                currentContent.validationDecision || "tayang",
                                currentContent.validationReason,
                                e.target.value,
                              )
                            }
                            className="mt-1 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Navigation Footer */}
              <div className="px-4 py-3 border-t bg-white">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={handlePrevContent} disabled={currentContentIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-2">
                    {getValidationIcon(currentContent.validationDecision)}
                    <span className="text-sm text-gray-600">
                      {currentContent.isValidated ? "Validated" : "Pending"}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleNextContent}
                    disabled={!currentContent.isValidated}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentContentIndex === contentItems.length - 1 ? "Summary" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="h-full flex flex-col">
              {/* Summary Header */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">Validation Summary</h3>
                <p className="text-sm text-gray-600">Review your validation decisions</p>
              </div>

              <ScrollArea className="flex-1 px-4 py-4">
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="text-center">
                      <CardContent className="p-3">
                        <div className="text-lg font-bold text-gray-900">{validationSummary.total}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-3">
                        <div className="text-lg font-bold text-green-600">{validationSummary.tayang}</div>
                        <div className="text-xs text-gray-500">Approved</div>
                      </CardContent>
                    </Card>
                    <Card className="text-center">
                      <CardContent className="p-3">
                        <div className="text-lg font-bold text-red-600">{validationSummary.tidakTayang}</div>
                        <div className="text-xs text-gray-500">Rejected</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Content List */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Content Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {contentItems.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                          <div className="flex-shrink-0">{getContentIcon(item.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            {item.validationReason && (
                              <p className="text-xs text-gray-500 truncate">{item.validationReason}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">{getValidationIcon(item.validationDecision)}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Publish Date */}
                  {validationSummary.tayang > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Publication Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div>
                          <Label htmlFor="publishDate" className="text-sm">
                            Publish Date (Optional)
                          </Label>
                          <input
                            type="datetime-local"
                            id="publishDate"
                            value={publishDate}
                            onChange={(e) => setPublishDate(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty to validate without immediate publication
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Final Notes */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Final Validation Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Add overall validation notes..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Submit Footer */}
              <div className="px-4 py-3 border-t bg-white">
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(0)} className="flex-1">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Review
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitValidation}
                    disabled={!allContentValidated || isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Validation
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
