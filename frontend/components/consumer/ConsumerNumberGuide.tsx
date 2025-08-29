'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Search, Zap, CheckCircle } from 'lucide-react'

export default function ConsumerNumberGuide() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <FileText className="h-5 w-5" />
          How to Find Your Consumer Number
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Look for these labels:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Consumer Number</li>
                  <li>• Consumer ID</li>
                  <li>• Account Number</li>
                  <li>• Service Connection Number</li>
                  <li>• Customer ID</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Common formats:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 10-12 digit number</li>
                  <li>• May include letters</li>
                  <li>• Usually on the top section</li>
                  <li>• Near your name/address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-gray-900">Sample Locations by Board:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <strong>MSEB:</strong> Top-right corner as &quot;Consumer No.&quot;
            </div>
            <div>
              <strong>TNEB:</strong> &quot;Service Connection No.&quot; in header
            </div>
            <div>
              <strong>KSEB:</strong> &quot;Consumer Number&quot; below customer details
            </div>
            <div>
              <strong>PSEB:</strong> &quot;Account ID&quot; in the top section
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>💡 Can&apos;t find it? Contact your electricity board or check your previous bills</p>
        </div>
      </CardContent>
    </Card>
  )
}
